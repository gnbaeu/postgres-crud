<?php
namespace Tests\Feature;
use App\Http\Requests\ApiRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Tests\TestCase;
class ValidationTest extends TestCase {
 private function payload(array $data,string $kind,string $method='POST'):array{return ApiRequest::create('/api/test',$method,[],[],[],['CONTENT_TYPE'=>'application/json'],json_encode($data))->payload($kind);}
 public function test_normalization_and_customer_defaults():void{$v=$this->payload(['first_name'=>' A ','last_name'=>'B','store_id'=>'2','address_id'=>3],'customer');$this->assertSame('A',$v['first_name']);$this->assertSame(2,$v['store_id']);$this->assertTrue($v['active']);$this->assertNull($v['email']);}
 public function test_strict_field_boolean_and_bcrypt_byte_validation():void{
  foreach([
   [['email'=>'a@example.test','password'=>str_repeat('あ',25)],'login','POST'],
   [['active'=>'true'],'customer','PATCH'],
   [['role'=>'owner'],'customer','PATCH'],
   [['heading'=>'changed'],'content','PATCH'],
   [['slug'=>'home','locale'=>'ja','heading'=>'A','description'=>'B'],'content','POST'],
  ] as [$data,$kind,$method]){try{$this->payload($data,$kind,$method);$this->fail('Invalid payload accepted');}catch(HttpResponseException $e){$this->assertSame(400,$e->getResponse()->getStatusCode());$this->assertSame('{"error":"Invalid request data."}',$e->getResponse()->getContent());}}
 }
}
