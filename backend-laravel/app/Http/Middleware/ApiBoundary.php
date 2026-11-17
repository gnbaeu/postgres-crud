<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class ApiBoundary {
 public function handle(Request $r,Closure $next){
  $origin=$r->header('Origin');$allowed=in_array($origin,config('gnwaa.origins'),true);
  if($r->isMethod('OPTIONS'))$response=response('', $allowed?204:403);
  elseif(strlen($r->getContent())>16384)$response=response()->json(['error'=>'The request could not be completed.'],500);
  elseif($r->isJson()&&strlen($r->getContent())&&(!is_array(json_decode($r->getContent(),true))||json_last_error()!==JSON_ERROR_NONE))$response=response()->json(['error'=>'Invalid request.'],400);
  else $response=$next($r);
  $response->headers->set('X-Content-Type-Options','nosniff');$response->headers->set('X-Frame-Options','SAMEORIGIN');
  $response->headers->set('Referrer-Policy','no-referrer');$response->headers->set('Cross-Origin-Resource-Policy','same-origin');
  $response->headers->set('Content-Security-Policy',"default-src 'none'; frame-ancestors 'self'");
  if($r->isSecure())$response->headers->set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  if($r->is('api/auth/*')||$r->is('api/admin/*'))$response->headers->set('Cache-Control','no-store');
  if($allowed){$response->headers->set('Access-Control-Allow-Origin',$origin);$response->headers->set('Access-Control-Allow-Credentials','true');$response->headers->set('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');$response->headers->set('Access-Control-Allow-Headers','Content-Type,X-CSRF-Token');$response->setVary('Origin',false);}
  return $response;
 }
}
