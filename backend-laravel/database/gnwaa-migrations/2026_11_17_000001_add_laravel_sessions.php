<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
 public function up():void{
  DB::statement('CREATE TABLE IF NOT EXISTS gnwaa_app.laravel_sessions (id varchar(255) PRIMARY KEY,user_id bigint NULL,ip_address varchar(45) NULL,user_agent text NULL,payload text NOT NULL,last_activity integer NOT NULL)');
  DB::statement('GRANT SELECT,INSERT,UPDATE,DELETE ON gnwaa_app.laravel_sessions TO gnwaa_app_runtime');
  DB::statement('CREATE INDEX IF NOT EXISTS laravel_sessions_activity_idx ON gnwaa_app.laravel_sessions(last_activity)');
 }
 public function down():void{throw new RuntimeException('Non-destructive migration: rollback switches the API, never removes data.');}
};
