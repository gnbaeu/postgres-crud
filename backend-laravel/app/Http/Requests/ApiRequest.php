<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
class ApiRequest extends FormRequest {
 public function authorize():bool{return true;}
 public function rules():array{return [];}
 protected function failedValidation(Validator $v){$this->invalid();}
 private function invalid():never{throw new HttpResponseException(response()->json(['error'=>'Invalid request data.'],400));}
 private function text($v,int $max):string{if(!is_string($v)||mb_strlen(trim($v))<1||mb_strlen(trim($v))>$max)$this->invalid();return trim($v);}
 private function exact(array $v,array $keys):void{if(array_diff(array_keys($v),$keys))$this->invalid();}
 private function email($v):string{if(!is_string($v)||strlen(trim($v))>254||!filter_var(trim($v),FILTER_VALIDATE_EMAIL))$this->invalid();return strtolower(trim($v));}
 private function version($v):string{if(!is_string($v)||!preg_match('/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/',$v)||strtotime($v)===false)$this->invalid();return $v;}
 public function payload(string $kind):array {
  $raw=json_decode($this->getContent());if(!$raw instanceof \stdClass)$this->invalid();$v=(array)$raw;
  if($kind==='login'){$this->exact($v,['email','password']);$email=$this->email($v['email']??null);$p=$v['password']??null;if(!is_string($p)||strlen($p)<1||strlen($p)>72)$this->invalid();return ['email'=>$email,'password'=>$p];}
  if($kind==='bulk'){
   $this->exact($v,['locale','status','home','about']);if(!in_array($v['locale']??null,['mn','en'],true)||!in_array($v['status']??null,['draft','published'],true))$this->invalid();
   foreach(['home','about'] as $slug){if(!($v[$slug]??null) instanceof \stdClass)$this->invalid();$e=(array)$v[$slug];$this->exact($e,['heading','description','content_id','updated_at']);if(!array_key_exists('content_id',$e)||!array_key_exists('updated_at',$e)||(($e['content_id']===null)!==($e['updated_at']===null)))$this->invalid();if($e['content_id']!==null){if(!is_string($e['content_id'])||!preg_match('/^[1-9]\d{0,17}$/',$e['content_id']))$this->invalid();$this->version($e['updated_at']);}$e['heading']=$this->text($e['heading']??null,240);$e['description']=$this->text($e['description']??null,2000);$v[$slug]=$e;}return $v;
  }
  $patch=$this->isMethod('PATCH');$customer=$kind==='customer';
  $keys=$customer?['first_name','last_name','email','store_id','address_id','active']:['slug','locale','heading','description','status'];
  $this->exact($v,$patch&&!$customer?[...$keys,'updated_at']:$keys);
  if(!$patch){foreach($customer?['first_name','last_name','store_id','address_id']:['slug','locale','heading','description'] as $k)if(!array_key_exists($k,$v))$this->invalid();$v+= $customer?['email'=>null,'active'=>true]:['status'=>'draft'];}
  if($patch&&count(array_intersect(array_keys($v),$keys))===0)$this->invalid();
  if($patch&&!$customer)$v['updated_at']=$this->version($v['updated_at']??null);
  foreach($v as $k=>$value){
   if(in_array($k,['first_name','last_name','heading','description']))$v[$k]=$this->text($value,$k==='heading'?240:($k==='description'?2000:100));
   elseif($k==='email')$v[$k]=$value===null||$value===''?null:$this->email($value);
   elseif(in_array($k,['store_id','address_id'])){if(!is_scalar($value)||!is_numeric($value)&&!is_bool($value))$this->invalid();$number=(float)$value;if($number<1||$number>2147483647||floor($number)!==$number)$this->invalid();$v[$k]=(int)$number;}
   elseif($k==='active'&&!is_bool($value))$this->invalid();
   elseif($k==='slug'&&!in_array($value,['home','about'],true))$this->invalid();
   elseif($k==='locale'&&!in_array($value,['mn','en'],true))$this->invalid();
   elseif($k==='status'&&!in_array($value,['draft','published'],true))$this->invalid();
  }return $v;
 }
}
