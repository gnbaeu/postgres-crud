<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class LoginLimit {
 public static function key(Request $r):string{return hash_hmac('sha256',$r->ip()??'unknown',config('app.key'));}
 public function handle(Request $r,Closure $next){
  $row=DB::selectOne("INSERT INTO gnwaa_app.login_attempt_limits(key_hash,hit_count,reset_at) VALUES (?,1,now()+(? * interval '1 millisecond')) ON CONFLICT(key_hash) DO UPDATE SET hit_count=CASE WHEN login_attempt_limits.reset_at<=now() THEN 1 ELSE login_attempt_limits.hit_count+1 END,reset_at=CASE WHEN login_attempt_limits.reset_at<=now() THEN now()+(? * interval '1 millisecond') ELSE login_attempt_limits.reset_at END,updated_at=now() RETURNING hit_count,reset_at",[self::key($r),config('gnwaa.login_window_ms'),config('gnwaa.login_window_ms')]);
  if($row->hit_count>config('gnwaa.login_max_attempts'))return response()->json(['error'=>'Too many login attempts. Try again later.'],429)->header('Retry-After',(string)max(1,ceil(strtotime($row->reset_at)-time())));
  return $next($r);
 }
}
