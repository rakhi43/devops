var express = require("express");
var app = express();
var router = express.Router();
var request = require("request");
var session = require('express-session');
var path = require("path");
const fileUpload = require('express-fileupload');

var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('./config.json');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var userService = require("./services/user.service");
//var custom_function = require("app/helper/custom_function");

app.use(express.static(path.join(__dirname, 'app/')));
app.use(express.static(path.join(__dirname, 'app/*')));
app.use("/uploads",express.static(path.join(__dirname, 'uploads/')));
app.use("/uploads",express.static(path.join(__dirname, 'uploads/*')));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: true, saveUninitialized: true }));

//app.use('/login', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/getsesionvalue'] }));

app.use("/login",require("./controllers/login.controller"));
app.use("/home",require("./controllers/home.controller"));
app.use("/api/users",require("./controllers/api/users.controller"));

app.get('/', function (req, res) {
    return res.redirect('/login');
});

app.get('/searching', function(req, res)
{
	
	/*var val = req.query.search;
	var command = req.query.command;
	res.send(customservice.searching(val,command)); 
	*/
	 var val = req.query.search;
	 var command = req.query.command;
	 //console.log(val);
	 res.setHeader('Access-Control-Allow-Origin', '*');
         if(command=="active_requests")
         {
             
            var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name, service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 0 and runner_id != 0 and is_accepted_by_runner = 1 and users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 //var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name,service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 1  AND users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 userService.runQuery(sql)
		.then(function(result){
                    var data = [];
                    if(result.length  > 0){
                        for(var i =0;i<result.length;i++){
                        var name = result[i].name;
                        var id = result[i].id;
                        var phn_no = result[i].phn_no;
                        var service_name = result[i].service_name+" ("+result[i].category_name+")";
                        var from_location = result[i].from_location;
                        var to_location = result[i].to_location;
                        var delivery_type = result[i].delivery_type;
                        var request_date = result[i].request_date;
                        var runner_id=result[i].runner_id;
                        var distance = result[i].distance;
                        var runner_name = result[i].runner_name;

                        //var thumb_url = config.siteUrl+""+result[i].thumb_path
                        var ob = {id:id,runner_id:runner_id,name:name,phn_no:phn_no,service_name:service_name,from_location:from_location,to_location:to_location,delivery_type:delivery_type,request_date:request_date,distance:distance,runner_name:runner_name,};
                        data.push(ob);
                        }
                        response = {
                                status:200,
                                data:data
                        }
			}else{
                            response = {
                                    status:201,
                                    data:data
                            }
			}
			res.send(response);
		})
		.catch(function(err){
                    colsole.log(err);
			response = {
				status:500,
				msg:'error'+err
			}
			res.send(response);
		}); 
             
             
         }else if(command=="services")
	 { 
		var sql = "select services.* , service_category.category_name , service_sub_cat.sub_cat_name from services inner join service_category on services.cat_id = service_category.id inner join service_sub_cat on services.sub_cat_id = service_sub_cat.id where services.is_active = 1 and services.cat_id in (select id from service_category where service_category.is_active = 1) and services.service_name LIKE '%"+val+"%'";
		 //var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name,service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 1  AND users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 userService.runQuery(sql)
		.then(function(result){
			var data = [];
			if(result.length  > 0){
				for(var i =0;i<result.length;i++){
					var service_name = result[i].service_name;
					var price = result[i].price;
					var emergency_price = result[i].emergency_price;
					var maximum_acepted_weight = result[i].maximum_acepted_weight;
					var thumb_path = config.siteUrl+""+result[i].thumb_path;
					var category = result[i].category_name;
					var sub_category = result[i].sub_cat_name;
					/*var to_location = result[i].to_location;
					var delivery_type = result[i].delivery_type;
					var request_date = result[i].request_date;
					var delivery_date = result[i].delivery_date;
					var distance = result[i].distance;
					var assigned_to = result[i].runner_name;
					
					var thumb_url = config.siteUrl+""+result[i].thumb_path*/
					var ob = {category:category,sub_category:sub_category,service_name:service_name,price:price,emergency_price:emergency_price,maximum_acepted_weight:maximum_acepted_weight,thumb_path:thumb_path};
					data.push(ob);
				}
				response = {
					status:200,
					data:data
				}
			}else{
				response = {
					status:201,
					data:data
				}
			}
			res.send(response);
		})
		.catch(function(err){
			response = {
				status:500,
				msg:'error'+err
			}
			res.send(response);
		});
		
	 }else if(command=="completed_requests")
	 {
		 var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name,service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 1  AND users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 //var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name,service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 1  AND users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 userService.runQuery(sql)
		.then(function(result){
			var data = [];
			if(result.length  > 0){
				for(var i =0;i<result.length;i++){
					var id = result[i].id;
					var name = result[i].name;
					var contact_no = result[i].phn_no;
					var service_name = result[i].service_name;
					var from_location = result[i].from_location;
					var to_location = result[i].to_location;
					var delivery_type = result[i].delivery_type;
					var request_date = result[i].request_date;
					var delivery_date = result[i].delivery_date;
					var distance = result[i].distance;
					var assigned_to = result[i].runner_name;
					
					var thumb_url = config.siteUrl+""+result[i].thumb_path
					var ob = {id:id,name:name,delivery_type:delivery_type,contact_no:contact_no,service_name:service_name,from_location:from_location,to_location:to_location,request_date:request_date,delivery_date:delivery_date,distance:distance,assigned_to:assigned_to,thumb_url:thumb_url};
					data.push(ob);
				}
				response = {
					status:200,
					data:data
				}
			}else{
				response = {
					status:201,
					data:data
				}
			}
			res.send(response);
		})
		.catch(function(err){
			response = {
				status:500,
				msg:'error'+err
			}
			res.send(response);
		});
	 }else if(command=="cancelled_requests")
	 {
		var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name,service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 2  AND users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 //var sql = "select service_request.*, services.service_name, users.name, users.phn_no, u.name as runner_name,service_category.category_name from service_request inner join services on service_request.service_id = services.id inner join users on service_request.user_id = users.id inner join users as u on service_request.runner_id = u.id inner join service_category on services.cat_id = service_category.id where status = 1  AND users.name LIKE '%"+val+"%' order by service_request.request_date desc";
		 userService.runQuery(sql)
		.then(function(result){
			var data = [];
			if(result.length  > 0){
				for(var i =0;i<result.length;i++){
					var id = result[i].id;
					var name = result[i].name;
					var contact_no = result[i].phn_no;
					var service_name = result[i].service_name;
					var from_location = result[i].from_location;
					var to_location = result[i].to_location;
					var delivery_type = result[i].delivery_type;
					var request_date = result[i].request_date;
					var delivery_date = result[i].delivery_date;
					var distance = result[i].distance;
					var assigned_to = result[i].runner_name;
					
					var thumb_url = config.siteUrl+""+result[i].thumb_path
					var ob = {id:id,name:name,delivery_type:delivery_type,contact_no:contact_no,service_name:service_name,from_location:from_location,to_location:to_location,request_date:request_date,delivery_date:delivery_date,distance:distance,assigned_to:assigned_to,thumb_url:thumb_url};
					data.push(ob);
				}
				response = {
					status:200,
					data:data
				}
			}else{
				response = {
					status:201,
					data:data
				}
			}
			res.send(response);
		})
		.catch(function(err){
			response = {
				status:500,
				msg:'error'+err
			}
			res.send(response);
		}); 
	 }
	 
	
	//res.send(val); 
});

app.get('/file_upload', function (req, res) {
    res.sendFile('addcategory.html', { root: path.join(__dirname, './') });
});
// can add parameter in url ( '/farcus/:farcus/' farcus is url name and :farcus is key to get that value by request.params.farcus)
app.get(['/completedrequests1','/completedrequests', '/cancelledrequests','/activerequests','/servicecategories','/services','/runners','/runner_application','/runners/:runner_id','/logout','/profile','/subcategories'], function (req, res) {
	var url = req.url;
    if ((req.path !== '/login' || req.path !== '/' )&& req.session.token === undefined) {
        return res.redirect('/login?returnUrl=' + encodeURIComponent(url));
    }else{
    	res.sendFile(__dirname+"/app/index_home.html");
    }
});

app.get("/*",function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

/*events for socket */

io.sockets.on('connection', function(socket){
	
	socket.on('update_runner_latlng', function(data){
	      var json_data = JSON.parse(data);
	      var runner_id = json_data.runner_id;
	      var lat_lng = json_data.lat_lng;
		  if(socket.user_id != runner_id){
			socket.join(runner_id);
			socket.user_id = runner_id;
		  }
	      var sql = "update users set currnet_lat_lng = '"+lat_lng+"' where id = "+runner_id;
	      userService.runQuery(sql).then(function(res){
			  //console.log(res);
			 }).catch(function(err){}); 
	  });
	  
	  socket.on('update_consumer_latlng', function(data){
	      var json_data = JSON.parse(data);
	      var user_id = json_data.user_id;
	      var lat_lng = json_data.latlng;
		  if(socket.user_id != user_id){
			socket.join(user_id);
			socket.user_id = user_id;
		  }
	      var sql = "update users set currnet_lat_lng = '"+lat_lng+"' where id = "+user_id;
	      userService.runQuery(sql).then(function(res){
			  //console.log(res);
			 }).catch(function(err){});
	  });
	  
	  socket.on('track_user', function(data){
	      var json_data = JSON.parse(data);
	      var user_id = json_data.user_id;
	      var track_id = json_data.track_id;
		  
	      var sql = "select currnet_lat_lng from users where id = "+track_id;
	      userService.runQuery(sql).then(function(res){
			  if(res.length > 0){
				  var crr_latlng = res[0].currnet_lat_lng;
				  var response = {
						status:200,
						msg:'found',
						crr_latlng:crr_latlng
					};
				io.sockets.in(user_id).emit('track_user',response);	
			  }else{
				  var crr_latlng = "";
				  var response = {
						status:201,
						msg:'not found',
						crr_latlng:crr_latlng
					};
				io.sockets.in(user_id).emit('track_user',response);
			  }
			 }).catch(function(err){});
	  });
	  
});

server.listen(3024,function(){
	console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

/*var server = app.listen(8086, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});*/

