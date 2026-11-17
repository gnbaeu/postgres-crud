<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Account extends Model {
 protected $table='gnwaa_app.accounts';
 protected $primaryKey='account_id';
 protected $keyType='string';
 public $timestamps=false;
 protected $guarded=['account_id'];
 protected $hidden=['password_hash'];
 protected function casts():array{return ['active'=>'boolean','is_active'=>'boolean'];}
}
