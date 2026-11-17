<?php
namespace App\Http\Middleware;
use App\Models\Account;
use Closure;
use Illuminate\Http\Request;
class AccountAccess {
 public function handle(Request $r,Closure $next,string $role='authenticated'){
  $id=$r->session()->get('accountId');$at=$r->session()->get('authenticatedAt');
  $account=$id&&is_numeric($at)&&microtime(true)*1000-$at<=43200000?Account::select('account_id','email','role','is_active')->find($id):null;
  if(!$account||!$account->is_active){$r->session()->invalidate();return response()->json(['error'=>'Authentication required.'],401);}
  if($role==='owner'&&$account->role!=='owner')return response()->json(['error'=>'Owner access required.'],403);
  $r->attributes->set('account',$account);return $next($r);
 }
}
