<?php
namespace Tests\Feature;
use Tests\TestCase;
class ExampleTest extends TestCase {public function test_root_has_no_frontend_or_owner_registration():void{$this->getJson('/')->assertStatus(404);}}
