<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
class AppServiceProvider extends ServiceProvider {
 public function boot():void{
  if(!in_array(config('session.same_site'),['lax','strict','none'],true)||config('session.same_site')==='none'&&!config('session.secure'))throw new \RuntimeException('Invalid session cookie settings.');
  if(config('gnwaa.login_max_attempts')<1||config('gnwaa.login_window_ms')<1000)throw new \RuntimeException('Invalid login limiter settings.');
  foreach(config('gnwaa.origins') as $origin){$u=parse_url($origin);if(!$u||isset($u['path'])||isset($u['query'])||isset($u['fragment'])||isset($u['user'])||!isset($u['scheme'],$u['host'])||($u['scheme']!=='https'&&!($u['scheme']==='http'&&in_array($u['host'],['localhost','127.0.0.1'],true))))throw new \RuntimeException('Exact HTTPS origins required; HTTP is local-only.');}
  if($this->app->environment('production')&&(!env('CORS_ORIGINS')||!config('app.key')))throw new \RuntimeException('Production requires explicit origins and APP_KEY.');
 }
}
