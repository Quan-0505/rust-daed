"""Smoke-test the real release UI/API with temporary synthetic account state."""
import argparse,json,os,pathlib,secrets,subprocess,tempfile,time,urllib.request,urllib.error
p=argparse.ArgumentParser();p.add_argument('--binary',required=True);p.add_argument('--web',required=True);p.add_argument('--report',required=True);a=p.parse_args()
for ns in ('net','mnt'):
    assert os.stat('/proc/self/ns/'+ns).st_ino!=os.stat('/proc/1/ns/'+ns).st_ino,'Use a disposable mount/network namespace'
with tempfile.TemporaryDirectory(prefix='rust-daed-release-api-') as temp:
    root=pathlib.Path(temp);token=None
    env=dict(os.environ)
    for key in list(env):
        if key.startswith('PRODUCT_RUNTIME_FAKE'):env.pop(key)
    log=(root/'output.log').open('wb')
    child=subprocess.Popen([a.binary,'run','-c',temp,'--state',str(root/'daed.db'),'--listen','127.0.0.1:17070','--web-root',a.web,'--control',str(root/'control.sock')],stdout=log,stderr=subprocess.STDOUT,env=env)
    def request(path,data=None):
        headers={'Content-Type':'application/json'}
        if token:headers['Authorization']='Bearer '+token
        req=urllib.request.Request('http://127.0.0.1:17070'+path,data=json.dumps(data).encode() if data is not None else None,headers=headers)
        with urllib.request.urlopen(req,timeout=10) as response:return response.status,response.read()
    try:
        for attempt in range(100):
            if child.poll() is not None:raise RuntimeError((root/'output.log').read_text())
            try:
                code,body=request('/api/health');break
            except (urllib.error.URLError,ConnectionError):time.sleep(.1)
        else:raise RuntimeError('API did not become ready')
        assert code==200 and json.loads(body)['healthCheck']==1
        for command in (
            [a.binary,'validate','-c',temp,'--state',str(root/'daed.db')],
            [a.binary,'wait-ready','--control',str(root/'control.sock'),'--timeout','5s'],
        ):
            check=subprocess.run(command,capture_output=True,text=True,timeout=15)
            assert check.returncode==0,check.stdout+check.stderr
        code,body=request('/');assert code==200 and b'<html' in body.lower()
        code,body=request('/api/auth/users',{'username':'release-test','password':secrets.token_urlsafe(24)})
        assert code==201;created_token=json.loads(body)['token']
        # After account setup, protected logs must reject anonymous access.
        try:request('/api/logs?level=all')
        except urllib.error.HTTPError as error:assert error.code in (401,403)
        else:raise AssertionError('Anonymous log access accepted')
        token=created_token
        code,body=request('/api/user/me');assert code==200 and json.loads(body)['username']=='release-test'
        code,body=request('/api/logs?level=all');assert code==200;json.loads(body)
        code,body=request('/api/runtime/overview');assert code==200;json.loads(body)
        assert child.poll() is None
        pathlib.Path(a.report).write_text(json.dumps({'productionBinary':True,'fakeRuntimeUsed':False,'validateAndWaitReady':True,'webServed':True,'health':True,'syntheticAccountLogin':True,'anonymousLogsRejected':True,'authenticatedLogsAndOverview':True,'engineForwardingTested':False},indent=2)+'\n')
        print('Real release UI/API, synthetic account, protected logs and overview: PASS')
    finally:
        child.terminate()
        try:child.wait(timeout=15)
        except subprocess.TimeoutExpired:child.kill();child.wait()
        log.close()
