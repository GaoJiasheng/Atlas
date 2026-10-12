"""Compatibility entry point; shared renderer accepts --topic (default chest)."""
import importlib.util
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root))
spec=importlib.util.spec_from_file_location('anatomy_shared_preview',root/'preview.py')
shared=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=shared
spec.loader.exec_module(shared)
setup,pose,main=shared.setup,shared.pose,shared.main
if __name__ == '__main__':
    main()
