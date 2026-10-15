"""Prepare exact public upstream revisions without touching an existing tree."""
import hashlib,json,pathlib,subprocess,sys
repo=pathlib.Path(__file__).resolve().parents[1]
lock=json.loads((repo/'source/upstream.json').read_text())
root=pathlib.Path(sys.argv[1]).resolve()
if root.exists():raise SystemExit('Destination already exists; refusing to overwrite')
def run(*args,cwd=None):subprocess.run(args,cwd=cwd,check=True)
for name,target in [('ui',root),('core',root/'DaeNext')]:
    item=lock[name]
    run('git','clone',item['repository'],str(target))
    run('git','checkout','--detach',item['revision'],cwd=target)
patch=repo/'patches/sticky-ip-full.patch'
expected=lock['sticky_patch_sha256']
assert hashlib.sha256(patch.read_bytes()).hexdigest()==expected,'Unexpected sticky patch'
run('git','apply','--check',str(patch),cwd=root/'DaeNext')
run('git','apply',str(patch),cwd=root/'DaeNext')
assert (root/'DaeNext/crates/dae-outbound-core/src/sticky.rs').read_bytes()==(repo/'source/sticky.rs').read_bytes()
print('Pinned Rust UI/core and sticky patch prepared')
