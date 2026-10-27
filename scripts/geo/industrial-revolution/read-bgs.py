"""Read the selected native GB strata table, without optional GIS dependencies.

Input remains read-only. GeoPackage geometry/WKB are decoded directly; coordinate
transformation is performed separately by the installed mproj EPSG registry.
"""
import json
import sqlite3
import struct
import sys
from pathlib import Path


def geometry(blob):
    assert blob[:2] == b"GP"
    flags = blob[3]
    envelope = (flags >> 1) & 7
    offset = 8 + {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[envelope]

    def read(pos):
        endian = "<" if blob[pos] == 1 else ">"
        typ = struct.unpack_from(endian + "I", blob, pos + 1)[0]
        pos += 5
        assert typ in (3, 6), typ
        count = struct.unpack_from(endian + "I", blob, pos)[0]
        pos += 4
        parts = []
        for _ in range(count):
            if typ == 6:
                part, pos = read(pos)
            else:
                size = struct.unpack_from(endian + "I", blob, pos)[0]
                pos += 4
                part = [list(struct.unpack_from(endian + "dd", blob, pos + i * 16)) for i in range(size)]
                pos += size * 16
            parts.append(part)
        return parts, pos

    coords, end = read(offset)
    assert end == len(blob)
    return {"type": "MultiPolygon", "coordinates": coords}


root = Path(sys.argv[1])
file = root / "Coal Resources For New Technologies/Coal_Resources_For_New_Technologies_GB.gpkg"
db = sqlite3.connect(file.as_uri() + "?mode=ro", uri=True)
assert db.execute("pragma integrity_check").fetchone()[0] == "ok"
assert db.execute("select srs_id from gpkg_contents where table_name='Coal-bearing strata'").fetchone()[0] == 27700
features = [{"type": "Feature", "geometry": geometry(blob), "properties": {
    "id": "coal-gb-" + str(fid), "f": 1760, "src": ["G5"],
    "reference": "modern-geology", "surveyYear": 2004,
}} for fid, blob in db.execute('select fid, geom from "Coal-bearing strata" order by fid')]
assert len(features) == 622
print(json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":")))
