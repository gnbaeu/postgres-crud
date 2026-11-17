<?php
return [
 'driver'=>env('SESSION_DRIVER','database'), 'lifetime'=>480, 'expire_on_close'=>false,
 'encrypt'=>false,'serialization'=>'json','files'=>storage_path('framework/sessions'),
 'connection'=>null,'table'=>'gnwaa_app.laravel_sessions','store'=>null,'lottery'=>[2,100],
 'cookie'=>env('APP_ENV')==='production'?'__Host-gnwaa_laravel':'gnwaa_laravel',
 'path'=>'/','domain'=>null,'secure'=>env('APP_ENV')==='production'||env('COOKIE_SECURE',false),
 'http_only'=>true,'same_site'=>env('SESSION_COOKIE_SAME_SITE','lax'),'partitioned'=>false,
];
