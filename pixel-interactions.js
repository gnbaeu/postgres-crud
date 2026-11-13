const SOUND_KEY = 'gnwaa-sound-v1';
export function createSoundEngine({storage,AudioContextClass,now=()=>performance.now()}={}) {
  let enabled=false,context,active,lastAt=-Infinity,run=0;
  try { enabled=storage?.getItem(SOUND_KEY)==='on'; } catch {}
  function setEnabled(value) {
    enabled=Boolean(value);run++;
    if(!enabled){try{active?.stop();}catch{}active=null;}
    try{storage?.setItem(SOUND_KEY,enabled?'on':'off');}catch{}
  }
  async function play(kind='button') {
    if(!enabled || typeof AudioContextClass!=='function' || now()-lastAt<80)return false;
    lastAt=now();const token=++run;
    try {
      context ||= new AudioContextClass();
      if(context.state!=='running')await context.resume();
      if(!enabled||token!==run||context.state!=='running')return false;
      const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime;
      oscillator.type='square';oscillator.frequency.setValueAtTime(({navigation:520,draw:720,theme:440,welcome:640})[kind]||480,start);
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.018,start+.003);gain.gain.linearRampToValueAtTime(0,start+.055);
      oscillator.connect(gain);gain.connect(context.destination);active=oscillator;
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(active===oscillator)active=null;};
      oscillator.start(start);oscillator.stop(start+.06);return true;
    }catch{return false;}
  }
  return {isEnabled:()=>enabled,setEnabled,play};
}

const speaker='<path d="M1 6h3l4-4h1v12H8l-4-4H1Z"/>';
export function initPixelInteractions({translate}) {
  let storage;try{storage=window.localStorage;}catch{}
  const engine=createSoundEngine({storage,AudioContextClass:window.AudioContext||window.webkitAudioContext});
  const button=document.querySelector('#public-sound');
  if(!button)return engine;
  function render(){
    const on=engine.isEnabled(),label=translate('pz.'+(on?'soundDisable':'soundEnable'));
    button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(on));
    button.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">'+speaker+(on?'<path d="M11 4h2v2h-2Zm2 2h2v4h-2Zm-2 4h2v2h-2Z"/>':'<path d="m11 5 1-1 2 2 1-1 1 1-1 1 1 1-1 1-1-1-2 2-1-1 2-2Z"/>')+'</svg>';
  }
  document.addEventListener('click',event=>{
    if(!event.isTrusted||!document.body.classList.contains('jm-public'))return;
    const target=event.target.closest('button,a[href]');
    if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;
    if(target===button){engine.setEnabled(!engine.isEnabled());render();if(engine.isEnabled())void engine.play();return;}
    const kind=target.matches('[data-welcome-enter]')?'welcome':target.matches('[data-rz-action="draw"],[data-quick-action="draw"]')?'draw':target.tagName==='A'?'navigation':'button';
    void engine.play(kind);
  });
  document.addEventListener('change',event=>{
    if(document.body.classList.contains('jm-public')&&event.isTrusted&&event.target.matches('#public-appearance,#public-appearance-mobile,[data-welcome-theme]'))void engine.play('theme');
  });
  document.addEventListener('keydown',event=>{
    if(event.isTrusted&&event.key==='Enter'&&!event.repeat&&!event.isComposing&&event.target.closest('#terminal-welcome')&&!event.target.closest('select,input,textarea,a'))void engine.play('welcome');
  });
  window.addEventListener('gnwaa:public-view',render);
  render();return engine;
}
