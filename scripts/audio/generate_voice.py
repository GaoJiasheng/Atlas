#!/usr/bin/env python3
"""Fill the Atlas narration manifest with native edge-tts MP3 audio.

Install edge-tts in an external venv, then run that venv's Python with:
    python scripts/audio/generate_voice.py
    python scripts/audio/generate_voice.py --locale zh --limit 10
    python scripts/audio/generate_voice.py --dry-run

The default input is <repository>/audio/manifest.json, independent of cwd.
ATLAS_AUDIO_DIR overrides the audio directory (relative to cwd if relative).
--locale filters before --limit; --limit selects the first N matching clips,
including existing clips. --dry-run lists skips and planned writes without
creating directories, loading edge-tts, or making network requests.

See scripts/audio/README.md, especially the binding Generator contract.
Text, voice, and rate are passed through unchanged; edge-tts's native
audio-24khz-48kbitrate-mono-mp3 bytes are saved without re-encoding.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path
import random
import sys
import tempfile


NATIVE_FORMAT = "audio-24khz-48kbitrate-mono-mp3"
CONCURRENCY = 4
MAX_TRIES = 5


def nonnegative_int(value: str) -> int:
    number = int(value)
    if number < 0:
        raise argparse.ArgumentTypeError("must be zero or greater")
    return number


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--limit", type=nonnegative_int, metavar="N",
                        help="select the first N clips after the locale filter")
    parser.add_argument("--locale", choices=("en", "zh"))
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def load_clips(audio_dir: Path, args: argparse.Namespace) -> list[dict]:
    with (audio_dir / "manifest.json").open(encoding="utf-8") as source:
        manifest = json.load(source)
    if not isinstance(manifest, dict) or manifest.get("format") != NATIVE_FORMAT:
        raise ValueError(f"manifest format must be {NATIVE_FORMAT!r}; no re-encoding is supported")
    clips = manifest.get("clips")
    if not isinstance(clips, list):
        raise ValueError("manifest clips must be a list")
    selected = []
    destinations = set()
    for index, clip in enumerate(clips):
        if not isinstance(clip, dict):
            raise ValueError(f"clip {index}: must be an object")
        for field in ("locale", "voice", "rate", "file", "text"):
            if not isinstance(clip.get(field), str) or not clip[field].strip():
                raise ValueError(f"clip {index}: {field} must be a non-empty string")
        if clip["locale"] not in ("en", "zh"):
            raise ValueError(f"clip {index}: unsupported locale {clip['locale']!r}")
        relative = Path(clip["file"])
        destination = (audio_dir / relative).resolve()
        if relative.is_absolute() or audio_dir not in destination.parents:
            raise ValueError(f"clip {index}: file must be inside the audio directory")
        if destination in destinations:
            raise ValueError(f"duplicate clip file: {clip['file']}")
        destinations.add(destination)
        if args.locale is None or clip["locale"] == args.locale:
            selected.append(clip)
    return selected if args.limit is None else selected[:args.limit]


def is_complete(path: Path) -> bool:
    return path.is_file() and path.stat().st_size > 0


async def generate(clips: list[dict], audio_dir: Path, dry_run: bool) -> int:
    counts = {"done": 0, "skipped": 0, "failed": 0, "planned": 0}
    failures = []
    pending = []
    for clip in clips:
        if is_complete(audio_dir / clip["file"]):
            counts["skipped"] += 1
            print(f"SKIP {clip['file']}", flush=True)
        elif dry_run:
            counts["planned"] += 1
            print(f"PLAN {clip['file']} voice={clip['voice']} rate={clip['rate']}", flush=True)
        else:
            pending.append(clip)

    if pending:
        import aiohttp
        import edge_tts
        from edge_tts.exceptions import (
            NoAudioReceived, UnexpectedResponse, UnknownResponse, WebSocketError,
        )

        transient_errors = (aiohttp.ClientError, asyncio.TimeoutError, ConnectionError,
                            NoAudioReceived, UnexpectedResponse, UnknownResponse, WebSocketError)

        async def write_clip(clip: dict) -> str:
            destination = audio_dir / clip["file"]
            destination.parent.mkdir(parents=True, exist_ok=True)
            for attempt in range(1, MAX_TRIES + 1):
                if is_complete(destination):
                    return "skipped"
                fd, name = tempfile.mkstemp(prefix=f".{destination.name}.", suffix=".tmp",
                                            dir=destination.parent)
                temporary = Path(name)
                try:
                    # Each retry starts a fresh stream and a fresh temporary file.
                    with os.fdopen(fd, "wb") as output:
                        speech = edge_tts.Communicate(clip["text"], voice=clip["voice"],
                                                      rate=clip["rate"])
                        async for chunk in speech.stream():
                            if chunk["type"] == "audio":
                                output.write(chunk["data"])
                        output.flush()
                        os.fsync(output.fileno())
                    if temporary.stat().st_size == 0:
                        raise NoAudioReceived("service returned empty audio")
                    if is_complete(destination):
                        return "skipped"
                    os.replace(temporary, destination)
                    return "done"
                except transient_errors as error:
                    if attempt == MAX_TRIES:
                        raise RuntimeError(f"after {attempt} tries: {type(error).__name__}: {error}") from error
                    delay = 2 ** (attempt - 1) + random.uniform(0, 0.5)
                    print(f"RETRY {clip['file']} ({attempt}/{MAX_TRIES}): "
                          f"{type(error).__name__}: {error}; waiting {delay:.1f}s",
                          file=sys.stderr, flush=True)
                finally:
                    temporary.unlink(missing_ok=True)
                await asyncio.sleep(delay)
            raise RuntimeError("retry budget exhausted")

        work = iter(pending)

        async def worker() -> None:
            for clip in work:
                try:
                    status = await write_clip(clip)
                except Exception as error:
                    status = "failed"
                    reason = f"{type(error).__name__}: {error}"
                    failures.append((clip["file"], reason))
                    print(f"FAIL {clip['file']}: {reason}", file=sys.stderr, flush=True)
                else:
                    print(f"{status.upper()} {clip['file']}", flush=True)
                counts[status] += 1

        await asyncio.gather(*(worker() for _ in range(min(CONCURRENCY, len(pending)))))

    summary = f"Summary: done={counts['done']} skipped={counts['skipped']} failed={counts['failed']}"
    if dry_run:
        summary += f" planned={counts['planned']} (dry-run)"
    print(summary, flush=True)
    for filename, reason in failures:
        print(f"  {filename}: {reason}", file=sys.stderr)
    return 1 if failures else 0


def main() -> int:
    args = arguments()
    audio_dir = Path(os.environ.get("ATLAS_AUDIO_DIR") or
                     Path(__file__).resolve().parents[2] / "audio").resolve()
    try:
        clips = load_clips(audio_dir, args)
        return asyncio.run(generate(clips, audio_dir, args.dry_run))
    except KeyboardInterrupt:
        print("Interrupted; unfinished temporary files were cleaned up.", file=sys.stderr)
        return 130
    except (OSError, ValueError, ImportError) as error:
        print(f"Summary: done=0 skipped=0 failed=1\n  {type(error).__name__}: {error}",
              file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
