const server = "ws://127.0.0.1:5000"

//? GlobalVariable: Các biến để lưu dữ liệu trong chương trình [socket, username, isConnected, MessageQueue]
	var socket;
	var username = "";
	var isConnected = false;
	var MessageQueue = [];
//? HTMLQueryVariable: Các biến chứa nội dung HTML [savenamebutton, connectbutton, disconnectbutton, getbutton, noconnect, connected]
var savenamebutton = `<button id="savenamebutton" onclick="saveusername()" hidden="true">Lưu</button>`
const connectbutton = "<button id=\"connect\" onclick=\"connect()\">Kết nối với Server</button>"
const disconnectbutton = "<button id=\"disconnect\" onclick=\"disconnect();\">Ngắt kết nối với Server</button>"
const getbutton = "<button onclick=\"get()\" id=\"updatebutton\">Cập nhật</button>"
const noconnect = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username" disabled> ${savenamebutton} | <b>Trạng thái: </b>Chưa kết nối với Server | ` + connectbutton + "</p>"
const connected = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username"> ${savenamebutton} | <b>Trạng thái: </b>Đã kết nối với Server | ` + disconnectbutton + " " + getbutton + "</p>"

//? Method: Các Thủ tục gửi tin nhắn lên Server [nameaction(), get(), send()]
	function nameaction(name) {
		socket.send(`{"type":"name", "name":"${name}"}`)
	}
	function get() {
		inupdate()
		socket.send(`{"type":"get"}`)
	}
	function send(content) {
		if (content.length < 1 || content.length > 4000) return alert("Nội dung tin nhắn có ít nhất 1 ký tự và nhiều nhất 4000 ký tự!")
		socket.send(`{"type":"send", "content":"${content}"}`)
		MessageQueue.push({
			'name': username,
			'content': content
		})
		document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: right; margin-right: 7px;" class="QueueMessage"> <b>${username}:</b> ${content} <br> <i style="font-size: smaller;">Đang gửi...</i></p>`
	}	
//? SaveButton: Các thủ tục xoay quanh nút Lưu Biệt danh [hidesavebutton(), showsavebutton()]
	function hidesavebutton() {
		savenamebutton = `<button id="savenamebutton" onclick="saveusername() hidden="true">Lưu</button>`
		document.getElementById("savenamebutton").setAttribute("hidden", true)
	}
	
	function showsavebutton() {
		savenamebutton = `<button id="savenamebutton" onclick="saveusername()">Lưu</button>`
		document.getElementById("savenamebutton").removeAttribute("hidden")
	}	
//? UsernameMethod: Các thủ tục xoay quanh ô nhập Biệt danh [changeusername(), saveusername()]
	function changeusername(e) {
		if (username !== e.target.value) {
			showsavebutton()
		} else {
			hidesavebutton()
		}
		if (e.target.value == "") {
			e.target.value = username
			hidesavebutton()
		} else {
			if (e.target.value.length > 100) {
				e.target.value = username
				hidesavebutton()
			}
		}
	}
	
	function saveusername() {
		if (!isConnected) return alert("Bạn chưa kết nối với Server!")
		nameaction(document.getElementById('username').value)
	}
//? SendMethod: Các thủ tục kích hoạt ô Gửi và nút Gửi [enablesend(), disablesend()]
	function enablesend() {
		document.getElementById("noidung").removeAttribute("disabled")
		document.getElementById("send").removeAttribute("disabled")
	}
	
	function disablesend(can_copy) {
		if (can_copy == true) 
		{
			document.getElementById("send").setAttribute("disabled", true)
		} else {
			document.getElementById("noidung").setAttribute("disabled", true)
			document.getElementById("send").setAttribute("disabled", true)
		}
	}	
//? AfterDisconnect: Các thủ tục xoay quanh sự kiện Bắt đầu Ngắt kết nối với Server [disconnect(), delayconnect()]
	function disconnect() {
		socket.close();
		document.getElementById("content").innerHTML = "\t<!-- Chat will be shown here -->"
		document.getElementById("alert").innerHTML = noconnect
		delayconnect();
	}

	function delayconnect() {
		document.getElementById("connect").textContent = "Vui lòng đợi 3s để có thể Kết nối lại"
		document.getElementById("connect").setAttribute("disabled", true)
		setTimeout(() => {
			document.getElementById("connect").textContent = "Kết nối với Server";
			document.getElementById("connect").removeAttribute("disabled")
		}, 3000);
	}

	function disablecontentafterdisconnect() {
		if (isConnected == true) {
			document.getElementById('noidung').removeEventListener('input', disablecontentafterdisconnect)
		} else {
			if (document.getElementById('noidung').value.length === 0) {
				disablesend(false)
				document.getElementById('noidung').removeEventListener('input', disablecontentafterdisconnect)
			}
		}
	}

//? UpdateButton: Các thủ tục liên quan đến nút Cập nhật [inupdate(), afterupdate()]
	function inupdate() {
		document.getElementById("updatebutton").textContent = "Đang cập nhật..."
		document.getElementById("updatebutton").setAttribute("disabled", true)
	}

	function afterupdate() {
		document.getElementById("updatebutton").removeAttribute("disabled")
		document.getElementById("updatebutton").textContent = "Cập nhật"
	}

function find(array, name, content) {
	const query = {
		'name': name,
		'content': content
	}
	return array.indexOf(query)
}

document.getElementById("alert").innerHTML = noconnect

function connect() {
	document.getElementById("connect").textContent = "Đang kết nối..."
	document.getElementById("connect").setAttribute("disabled", true)

	socket = new WebSocket(server)

	socket.addEventListener('error', (event) => {
		alert("Không thể kết nối tới Server!")
		isConnected = false;
		document.getElementById("alert").innerHTML = noconnect
	})

	socket.addEventListener('close', (e) => {
		document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>Đã ngắt kết nối tới Server</b></p>`
		isConnected = false;
		document.getElementById("alert").innerHTML = noconnect
		document.getElementById('username').removeEventListener('input', changeusername)
		hidesavebutton()
		username = "";
		if (document.getElementById('noidung').value.length > 0) {
			disablesend(true)
			document.getElementById('noidung').addEventListener('input', disablecontentafterdisconnect)
		} else (disablesend(false))
	})

	socket.addEventListener('open', (event) => {
		document.getElementById("alert").innerHTML = connected
		document.getElementById('username').addEventListener('input', changeusername)
		isConnected = true;
	});

	socket.addEventListener('message', (event) => {
		let data = JSON.parse(event.data)
		switch (data.type) {
			case "name":
				switch (data.status) {
					case true:
						enablesend();
						switch (data.action) {
							case "register":
								document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Bạn đã đăng ký biệt danh "<b>${data.name}</b>" thành của mình</p>`;
								username = data.name;
								hidesavebutton(); get();
								break;
							case "change":
								document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Bạn đã đổi biệt danh "<b>${data.oldname}</b>" của mình thành "<b>${data.newname}</b>"</p>`;
								username = data.newname;
								hidesavebutton();
								break;
							}
						break;
					case false:
						switch (data.action) {
							case "register":
								switch (data.reason) {
									case "NameAlreadyUsed":
										alert(`"${data.name}" đã được sử dụng. Vui lòng đặt một biệt danh khác.`)
										break;
								
									case "WrongFormatName":
										alert(`Biệt danh của bạn phải có ít nhất 1 ký tự và nhiều nhất 100 ký tự`)
										break;

									case "ErrorWhenRegister":
										alert("Đã xảy ra lỗi trên Server khi đăng ký cho bạn. Xem Console để biết thêm.")
										console.error(`[Server] ` + data.error)
									
									default:
										alert("Đã xảy ra lỗi khi đăng ký tên: \""+ data.reason + "\"")
										break;
								}
								break;
							case "change":
								switch (data.reason) {
									case "NameAlreadyUsed":
										alert(`"${data.name}" đã được sử dụng. Vui lòng đặt một biệt danh khác.`)
										break;
								
									case "WrongFormatName":
										alert(`Biệt danh của bạn phải có ít nhất 1 ký tự và nhiều nhất 100 ký tự`)
										break;

									case "ErrorWhenChange":
										alert("Đã xảy ra lỗi trên Server khi đổi biệt danh cho bạn. Xem Console để biết thêm.")
										console.error(`[Server] ` + data.error)
									
									default:
										alert("Đã xảy ra lỗi khi đổi biệt danh: \""+ data.reason + "\"")
										break;
								}
								break;
						}
						break;
				}
				break;

			case "get":
				switch (data.status) {
					case true:
						document.getElementById("content").innerHTML = "\t<!-- Chat will be shown here -->"
						for (const tinnhan of data.data.message) {
							if (tinnhan.name == username) {
								document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: right; margin-right: 7px;"> <b>${tinnhan.name}:</b> ${tinnhan.content} <br> <i style="font-size: smaller;">Gửi vào lúc ${tinnhan.timestamp}</i></p>`
							} else {
								document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: left; margin-right: 7px;"> <b>${tinnhan.name}:</b> ${tinnhan.content} <br> <i style="font-size: smaller;">Gửi vào lúc ${tinnhan.timestamp}</i></p>`
							}
						}
						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Cập nhật tin nhắn</p>`;
						break;
				
					case false:
						switch (data.reason) {
							case "ErrorWhenGet":
								alert(`Không thể cập nhật full do đã xảy ra lỗi trên Server. Mở Console để biết thêm`)
								console.error("[Server] ErrorWhenGet: " + data.error);
								break;

							case "UnknownRegister":
								alert(`Bạn chưa đăng ký! Vui lòng đặt cho mình một biệt danh mới!`)
								break;
						
							default:
								alert("Đã xảy ra lỗi: " + data.reason)
								break;
						}
						break;
				}
				afterupdate();
				break;
		
			case "send":
				let arr = document.getElementsByClassName("QueueMessage")
				let pos = find(MessageQueue, data.name, data.content)
				switch (data.status) {
					case true:
						for (const html of arr) {
							if (html.innerHTML == ` <b>${data.name}:</b> ${data.content} <br> <i style="font-size: smaller;">Đang gửi...</i>`) {
								html.classList.remove("QueueMessage")
								html.innerHTML = ` <b>${username}:</b> ${data.content} <br> <i style="font-size: smaller;">Bạn đã gửi thành công vào lúc ${data.timestamp}</i>`
								MessageQueue.splice(pos, 1)
								break;
							}
						}
						break;
					case false:
						for (const html of arr) {
							if (html.innerHTML == ` <b>${data.name}:</b> ${data.content} <br> <i style="font-size: smaller;">Đang gửi...</i>`) {
								html.classList.remove("QueueMessage")
								let lydo = "";
								switch (data.reason) {
									case "UnknownRegister":
										lydo = "Bạn chưa đăng ký"
										break;
									
									case "ErrorWhenSend":
										lydo = "[Server] " + data.error;
										break;

									case "WrongFormatContent":
										lydo = "Nội dung tin nhắn có ít nhất 1 ký tự và nhiều nhất 4000 ký tự"
										break;

									default:
										lydo = "Lỗi: " + data.reason
										break;
								}
								html.innerHTML = ` <b>${username}:</b> ${content} <br> <i style="font-size: smaller; color: red;">Bạn đã gửi tin nhắn thất bại: ${lydo}</i>`
								MessageQueue.splice(pos, 1)
								break;
							}
						}
						break;
				}
		// TODO: Còn thiếu case "receive"
		}
	});
}