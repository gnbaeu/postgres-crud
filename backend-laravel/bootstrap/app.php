<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
return Application::configure(basePath:dirname(__DIR__))
 ->withRouting(web:__DIR__.'/../routes/web.php',commands:__DIR__.'/../routes/console.php')
 ->withMiddleware(function(Middleware $m):void {
  // API-only stack: no implicit trimming, null conversion, redirects or Laravel CSRF semantics.
  $m->use([\App\Http\Middleware\ApiBoundary::class]);
  $m->group('web',[\Illuminate\Cookie\Middleware\EncryptCookies::class,\Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,\Illuminate\Session\Middleware\StartSession::class]);
 })
 ->withExceptions(function(Exceptions $e):void {
  $e->shouldRenderJsonWhen(fn()=>true);
  $e->render(function(\Throwable $error,Request $request){
   if($error instanceof \Illuminate\Http\Exceptions\HttpResponseException)return $error->getResponse();
   if($error instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException)return response()->json(['error'=>'Not found.'],404);
   if($error instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException)return response()->json(['error'=>'Not found.'],404);
   $code=$error instanceof \Illuminate\Database\QueryException?($error->errorInfo[0]??''):'';
   $status=$code==='23505'?409:(in_array($code,['23514','23503'])?400:500);
   return response()->json(['error'=>$status===409?'A matching record already exists.':($status===400?'Invalid request.':'The request could not be completed.')],$status);
  });
  // SQL bindings and credentials must never appear in logs.
  $e->report(function(\Throwable $e){error_log('GNWAA request failed: '.get_class($e));return false;});
 })->create();
