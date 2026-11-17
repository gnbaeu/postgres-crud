<?php
return [
 'origins'=>array_filter(array_map('trim',explode(',',env('CORS_ORIGINS','http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5175,http://127.0.0.1:5176')))),
 'login_window_ms'=>(int)env('LOGIN_WINDOW_MS',900000), 'login_max_attempts'=>(int)env('LOGIN_MAX_ATTEMPTS',8),
];
