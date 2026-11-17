<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class Csrf {
 public function handle(Request $r,Closure $next){
  if(in_array($r->method(),['GET','HEAD','OPTIONS']))return $next($r);
  if($r->header('Origin')&&!in_array($r->header('Origin'),config('gnwaa.origins'),true))return response()->json(['error'=>'Request origin is not allowed.'],403);
  $token=$r->session()->get('csrfToken');
  if(!$token||!hash_equals($token,(string)$r->header('X-CSRF-Token')))return response()->json(['error'=>'CSRF validation failed.'],403);
  return $next($r);
 }
}
