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
def normalized_text(path):
    return path.read_text(encoding='utf-8').replace('\r\n','\n')
assert normalized_text(root/'DaeNext/crates/dae-outbound-core/src/sticky.rs')==normalized_text(repo/'source/sticky.rs')
sipa_patch=repo/'patches/sipa-rawip.patch'
expected=lock['sipa_rawip_patch_sha256']
assert hashlib.sha256(sipa_patch.read_bytes()).hexdigest()==expected,'Unexpected SIPA RAWIP patch'
run('git','apply','--unidiff-zero','--check',str(sipa_patch),cwd=root/'DaeNext')
run('git','apply','--unidiff-zero',str(sipa_patch),cwd=root/'DaeNext')
lpm_patch=repo/'patches/bpf-lpm-enomem-retry.patch'
expected=lock['bpf_lpm_patch_sha256']
assert hashlib.sha256(lpm_patch.read_bytes()).hexdigest()==expected,'Unexpected BPF LPM patch'
run('git','apply','--check',str(lpm_patch),cwd=root/'DaeNext')
run('git','apply',str(lpm_patch),cwd=root/'DaeNext')
print('Pinned Rust UI/core, sticky-ip, SIPA RAWIP, and BPF LPM retry patches prepared')
