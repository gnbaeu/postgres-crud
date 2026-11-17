<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CustomerRecord extends Model {
 protected $table='gnwaa_app.customer_records';
 protected $primaryKey='customer_id';
 protected $keyType='string';
 public $timestamps=false;
 protected $guarded=['customer_id'];
 protected $hidden=['password_hash'];
 protected function casts():array{return ['active'=>'boolean','is_active'=>'boolean'];}
}
