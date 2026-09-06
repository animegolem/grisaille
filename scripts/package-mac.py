from pathlib import Path
import plistlib
import shutil
import uuid

root = Path(__file__).resolve().parents[1]
contents = root / 'dist' / 'Music Prototype.app' / 'Contents'
(contents / 'MacOS').mkdir(parents=True, exist_ok=True)
(contents / 'Resources').mkdir(exist_ok=True)
temporary = contents / 'MacOS' / f'.music-ui-{uuid.uuid4()}'
shutil.copy2(root / 'dist' / 'music-ui', temporary)
temporary.replace(contents / 'MacOS' / 'music-ui')
with (contents / 'Info.plist').open('wb') as output:
    plistlib.dump({
        'CFBundleName': 'Music Prototype',
        'CFBundleDisplayName': 'Music Prototype',
        'CFBundleIdentifier': 'com.golem.mpd-ui-prototype',
        'CFBundleExecutable': 'music-ui',
        'CFBundlePackageType': 'APPL',
        'CFBundleVersion': '1',
        'CFBundleShortVersionString': '0.1.0',
        'NSHighResolutionCapable': True,
        'LSMinimumSystemVersion': '13.0',
    }, output)
print(contents.parent)
