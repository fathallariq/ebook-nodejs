var express = require('express');
var router = express.Router();
var modul = require('../modul/modul');

var session_store;
/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/books');
});
router.get('/login',function(req,res,next){
	res.render('main/login',{title:"Login Page"});
});

router.get('/register', function(req,res,next){
	res.render('main/register',{title:"Register Page"});
});

router.post("/register", function (req, res, next) {
	req.assert("name", "Please fill the name").notEmpty();
	req.assert("email", "Please fill the email").notEmpty();
	req.assert("phone", "Please fill the phone").notEmpty();
	req.assert("password", "Please fill the password").notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
	  v_name = req.sanitize("name").escape().trim();
	  v_email= req.sanitize("email").escape().trim();
	  v_phone = req.sanitize("phone").escape().trim();
	  v_password = req.sanitize("password").escape();
  
	  var users = {
		name: v_name,
		email: v_email,
		phone: v_phone,
		password: v_password,
	  };
  
	  var insert_sql = "INSERT INTO user SET ?";
	  req.getConnection(function (err, connection) {
		var query = connection.query(
		  insert_sql,
		  users,
		  function (err, result) {
			if (err) {
			  var errors_detail = ("Error Insert : %s ", err);
			  req.flash("msg_error", errors_detail);
			  res.render("main/register", {
				name: req.param("name"),
				email: req.param("email"),
				phone: req.param("phone"),
				password: req.param("password"),
				session_store: req.session,
			  });
			} else {
			  req.flash("msg_info", "Akun Berhasil Ditambahkan");
			  res.redirect("/login");
			}
		  }
		);
	  });
	} else {
	  console.log(errors);
	  errors_detail = "<p>Sory there are error</p><ul>";
	  for (i in errors) {
		error = errors[i];
		errors_detail += "<li>" + error.msg + "</li>";
	  }
	  errors_detail += "</ul>";
	  req.flash("msg_error", errors_detail);
	  res.render("main/register", {
		name: req.param("name"),
		email: req.param("email"),
		phone: req.param("phone"),
		password: req.param("password"),
		session_store: req.session,
	  });
	}
});

router.post('/login',function(req,res,next){
	session_store=req.session;
	req.assert('txtEmail', 'Please fill the Username').notEmpty();
	req.assert('txtEmail', 'Email not valid').isEmail();
	req.assert('txtPassword', 'Please fill the Password').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		req.getConnection(function(err,connection){
			v_pass = req.sanitize( 'txtPassword' ).escape().trim(); 
			v_email = req.sanitize( 'txtEmail' ).escape().trim();
			
			var query = connection.query('select * from user where email="'+v_email+'" and password="'+v_pass+'"',function(err,rows)
			{
				if(err)
				{

					var errornya  = ("Error Selecting : %s ",err.code );  
					console.log(err.code);
					req.flash('msg_error', errornya); 
					res.redirect('/login'); 
				}else
				{
					if(rows.length <=0)
					{

						req.flash('msg_error', "Wrong email address or password. Try again."); 
						res.redirect('/login');
					}
					else
					{	
						session_store.is_login = true;
						res.redirect('/books');
					}
				}

			});
		});
	}
	else
	{
		errors_detail = "<p>Sory there are error</p><ul>";
		for (i in errors) 
		{ 
			error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		console.log(errors_detail);
		req.flash('msg_error', errors_detail); 
		res.redirect('/login'); 
	}
});

router.get('/logout', function(req, res)
{ 
	req.session.destroy(function(err)
	{ 
		if(err)
		{ 
			console.log(err); 
		} 
		else 
		{ 
			res.redirect('/login'); 
		} 
	}); 
});
module.exports = router;
