<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SiteContent extends Model {
 protected $table='gnwaa_app.site_content';
 protected $primaryKey='content_id';
 protected $keyType='string';
 public $timestamps=false;
 protected $guarded=['content_id'];
 protected $hidden=['password_hash'];
 protected function casts():array{return ['active'=>'boolean','is_active'=>'boolean'];}
}
