<?php
namespace App\Http\Controllers;
use App\Http\Requests\ApiRequest;
use App\Http\Middleware\LoginLimit;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class AuthController {
 private function user($a):array{return ['id'=>(string)$a->account_id,'email'=>$a->email,'role'=>$a->role];}
 public function token(Request $r){if(!$r->session()->has('csrfToken'))$r->session()->put('csrfToken',rtrim(strtr(base64_encode(random_bytes(32)),'+/','-_'),'='));return response()->json(['csrfToken'=>$r->session()->get('csrfToken')]);}
 public function login(ApiRequest $r){$v=$r->payload('login');$a=Account::select('account_id','email','password_hash','role','is_active')->whereRaw('lower(email)=?',[$v['email']])->first();
  // Native verification accepts Express bcrypt $2a/$2b hashes without rehashing existing accounts.
  $valid=password_verify($v['password'],$a?->getRawOriginal('password_hash')??'$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
  if(!$a||!$a->is_active||!$valid)return response()->json(['error'=>'Email or password is incorrect.'],401);
  $r->session()->invalidate();$r->session()->put(['accountId'=>(string)$a->account_id,'authenticatedAt'=>(int)(microtime(true)*1000)]);
  DB::table('gnwaa_app.login_attempt_limits')->where('key_hash',LoginLimit::key($r))->delete();return response()->json(['user'=>$this->user($a)]);
 }
 public function me(Request $r){return response()->json(['user'=>$this->user($r->attributes->get('account'))]);}
 public function logout(Request $r){$r->session()->invalidate();return response('',204)->withCookie(cookie()->forget(config('session.cookie'),'/'));}
}
