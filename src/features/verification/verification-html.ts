import type { VerificationRequest } from '@/schemas/verification';
import { skadiScript } from './skadi-script';

export function verificationHtml(request: VerificationRequest): string {
  const input = JSON.stringify(request).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:transparent}#captcha{width:100%}</style></head><body><div id="captcha"></div><script>
  const input = ${input};
  let completed = false;
  function send(message) {
    if (completed) return; completed = true;
    if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    else window.parent.postMessage(message, '*');
  }
  function fail(){send({ok:false});}
  function load(src,ready){const script=document.createElement('script');script.src=src;script.onload=ready;script.onerror=fail;document.head.appendChild(script);}
  if(input.kind==='registration') {
    try { ${skadiScript}
      const noise=window.idaks.join('');
      send({ok:true,result:{noise,sign:window.skadi(input.email+'&'+input.password+'&'+noise)}});
    } catch(error){fail();}
  } else if(input.kind==='google') {
    const key='6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN';
    load('https://www.recaptcha.net/recaptcha/api.js?render='+key,()=>window.grecaptcha.ready(()=>{
      window.grecaptcha.execute(key,{action:'submit'}).then(token=>token?send({ok:true,result:token}):fail()).catch(fail);
    }));
  } else {
    const data=input.captcha;
    const v4=Boolean(data.geetestId);
    load(v4?'https://static.geetest.com/v4/gt4.js':'https://static.geetest.com/static/js/gt.0.5.0.js',()=>{
      const init=v4?window.initGeetest4:window.initGeetest;
      init(v4?{captchaId:data.geetestId,product:'bind',riskType:data.riskType}:{gt:data.gt,challenge:data.challenge,offline:false,product:'bind',https:true},obj=>{
        obj.onError(fail);
        if(obj.onClose)obj.onClose(fail);
        obj.onReady(()=>v4?obj.showCaptcha():obj.verify());
        obj.onSuccess(()=>{
          const result=obj.getValidate();
          if(!result){fail();return;}
          send({ok:true,result:{...result,challenge:data.challenge}});
          obj.destroy();
        });
      });
    });
  }
  </script></body></html>`;
}
