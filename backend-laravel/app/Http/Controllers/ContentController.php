<?php
namespace App\Http\Controllers;
use App\Models\SiteContent;
use Illuminate\Http\Request;
class ContentController {
 public function index(Request $r,?string $slug=null){
  $q=SiteContent::select('slug','locale','heading','description')->where('status','published')->where('locale',$r->query('locale')==='en'?'en':'mn');
  if($slug!==null){$row=$q->where('slug',$slug)->first();return $row?response()->json(['data'=>$row]):response()->json(['error'=>'Content not found.'],404);}
  return response()->json(['data'=>$q->orderBy('slug')->get()]);
 }
}
