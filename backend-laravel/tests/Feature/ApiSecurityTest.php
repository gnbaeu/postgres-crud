<?php
namespace Tests\Feature;
use Tests\TestCase;
class ApiSecurityTest extends TestCase {
 public function test_anonymous_owner_routes_require_authentication():void{$this->getJson('/api/admin/customers')->assertStatus(401)->assertExactJson(['error'=>'Authentication required.']);}
 public function test_csrf_and_origin_fail_closed_without_database():void{
  $this->postJson('/api/auth/login',['email'=>'owner@example.test','password'=>'test'])->assertStatus(403)->assertExactJson(['error'=>'CSRF validation failed.']);
  $this->postJson('/api/auth/logout',[],['Origin'=>'https://untrusted.example'])->assertStatus(403)->assertExactJson(['error'=>'Request origin is not allowed.']);
 }
 public function test_csrf_bootstrap_and_preflight():void{
  $this->getJson('/api/auth/csrf-token')->assertOk()->assertJsonStructure(['csrfToken']);
  $this->options('/api/auth/login',[],['Origin'=>'https://untrusted.example'])->assertStatus(403);
  $this->options('/api/auth/login',[],['Origin'=>'http://127.0.0.1:5175'])->assertStatus(204)->assertHeader('Access-Control-Allow-Credentials','true');
 }
 public function test_unknown_route_returns_api_error():void{$this->getJson('/api/missing')->assertStatus(404)->assertExactJson(['error'=>'Not found.']);}
}
