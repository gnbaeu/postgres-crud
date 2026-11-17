<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\{AuthController,ContentController,AdminController};
use App\Http\Middleware\{Csrf,AccountAccess,LoginLimit};
Route::get('/healthz',function(){try{DB::select('SELECT 1');return response()->json(['status'=>'ok']);}catch(\Throwable){return response()->json(['status'=>'unavailable'],503);}})->withoutMiddleware(\Illuminate\Session\Middleware\StartSession::class);
Route::get('/api/auth/csrf-token',[AuthController::class,'token']);
Route::post('/api/auth/login',[AuthController::class,'login'])->middleware([Csrf::class,LoginLimit::class]);
Route::post('/api/auth/logout',[AuthController::class,'logout'])->middleware(Csrf::class);
Route::get('/api/auth/me',[AuthController::class,'me'])->middleware(AccountAccess::class);
Route::get('/api/content',[ContentController::class,'index']);
Route::get('/api/content/{slug}',[ContentController::class,'index']);
Route::prefix('/api/admin')->middleware([AccountAccess::class.':owner',Csrf::class])->group(function(){
 Route::get('customers',[AdminController::class,'customers']);Route::post('customers',[AdminController::class,'createCustomer']);
 Route::get('customers/{id}',[AdminController::class,'customer']);Route::patch('customers/{id}',[AdminController::class,'patchCustomer']);Route::delete('customers/{id}',[AdminController::class,'deleteCustomer']);
 Route::get('content',[AdminController::class,'content']);Route::post('content',[AdminController::class,'createContent']);Route::post('content/bulk',[AdminController::class,'bulk']);Route::patch('content/{id}',[AdminController::class,'patchContent']);Route::delete('content/{id}',[AdminController::class,'deleteContent']);
});
Route::fallback(fn()=>response()->json(['error'=>'Not found.'],404));
