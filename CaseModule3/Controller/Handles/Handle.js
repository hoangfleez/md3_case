const BaseHandle=require('./baseHandle');
const qs = require("qs");
const formidable=require('formidable');
const fs = require("fs");
const url = require("url");
class Handle extends BaseHandle{
    async homepage(req, res){
        let html=await this.getTemplate('./Views/homepage.html');
        res.write(html);
        res.end();
    };

    async adminHomepage(req, res){
        let html=await this.getTemplate('./Views/users/adminUser/adminHomepage.html');
        res.write(html);
        res.end();
    };

    async userHomepage(req, res){
        let html=await this.getTemplate('./Views/users/user/userHomepage.html');
        res.write(html);
        res.end();
    };


    async showProductHomepage(req,res){
        let html=await this.getTemplate('./Views/CRUD/read.html');
        let sql='SELECT MaSP,hinhanh, tensp, gia from sanpham';
        let product=await this.getSQL(sql);
        let newHtml='';
        product.forEach((product)=>{
            newHtml+=`<div class="col-3 text-center py-3">
            <div>
                <img src="/upload/${product.hinhanh}" style="width: 150px; height:150px; object-fit:cover">
            </div>
            <div class="text-center ">
                <p>${product.tensp}</p>
                <p>${product.gia} VNĐ</p>
                <button type="button" class="btn btn-outline-primary">Thêm vào giỏ hàng</button>
            </div>
        </div>`
        })
        html=html.replace('{product-list}',newHtml);
        res.write(html);
        res.end();
    }

    //Hiển thị sản phẩm theo user
    async showProductUser(req,res){
        let html=await this.getTemplate('./Views/users/user/uRead.html');
        let sql='SELECT hinhanh,tensp,gia from sanpham';
        let productUser=await this.getSQL(sql);
        let newHtml='';
        productUser.forEach((productUser)=>{
            newHtml+=`<div class="col-3 text-center py-3">
            <div>
                <img src="/upload/${productUser.hinhanh}" style="width: 150px; height:150px; object-fit:cover">
            </div>
            <div class="text-center ">
                <p>${productUser.tensp}</p>
                <p>${productUser.gia} VNĐ</p>
                <button type="button" class="btn btn-outline-primary">Thêm vào giỏ hàng</button>
            </div>
        </div>`
        })
        html=html.replace('{product-list}',newHtml);
        res.write(html);
        res.end();
    }

    //Hiển thị sản phẩm theo admin
    async showAdminProduct(req,res){
        let html=await this.getTemplate('./Views/users/adminUser/aRead.html');
        let sql='SELECT MaSP,tensp,gia,soluong,hinhanh,mota from sanpham';
        let products=await this.getSQL(sql);
        let newHtml='';
        products.forEach((product)=>{
            newHtml+=`<tr>`
            newHtml+=`<td>${product.tensp}</td>`
            newHtml+=`<td>${product.gia}</td>`
            newHtml+=`<td>${product.soluong}</td>`
            newHtml+=`<td><img width="150" height="150" src="/upload/${product.hinhanh}"</td>`
            newHtml+=`<td>${product.mota}</td>`
            newHtml+=`<td><a onclick="return confirm('Bạn chắc muốn xóa sản phẩm này?')" href="/admin/delete?id=${product.MaSP}" class="btn btn-danger">Xóa</a>`
            newHtml+=`<td><a onclick="return " href="/admin/update?id=${product.MaSP}" class="btn btn-primary">Sửa</a>`
            newHtml+=`</tr>`
        })
        html=html.replace('{product-list}',newHtml);
        res.write(html);
        res.end();
    }

    async register(req,res){
        if (req.method==="GET"){
            let html= await this.getTemplate('./Views/Register.html');
            res.write(html);
            res.end();
        }else{
            let data='';
            req.on('data', chunk=>{
                data += chunk
            })
            req.on('end',async ()=>{
                let dataForm = qs.parse(data);
                let sql = `call addUser('${dataForm.username}','${dataForm.password}','${dataForm.name}','${dataForm.address}','${dataForm.phone}','2') `
                await this.getSQL(sql);
                res.writeHead(301, { Location: "/" });
                res.end();
            })
        }
    }

    async  addProduct(req,res){
        if(req.method==='GET'){
            let html=await this.getTemplate('./Views/CRUD/create.html');
            res.write(html);
            res.end();
        }else{

            let form=new formidable.IncomingForm();
            form.uploadDir='./upload/';
            form.parse(req,async(err,fields,files)=>{

                let newProduct={
                    name:fields.name,
                    price:fields.price,
                    quantity:fields.quantity,
                    img:files.img.originalFilename,
                    describe:fields.describe
                };
                let sql=`call createProduct('${newProduct.name}','${newProduct.price}','${newProduct.quantity}','${newProduct.img}','${newProduct.describe}')`;
                await this.getSQL(sql);
                let tmpPath = files.img.filepath;
                let desPath = form.uploadDir + files.img.originalFilename;
                fs.rename(tmpPath, desPath, (err) => {
                    if (err) console.log(err);
                });
                res.writeHead(301, { Location: "/admin/listProducts" });
                res.end();
            })
        };
    }

    async deleteProduct(req,res){
        //xoa san phẩm
        let query=url.parse(req.url,true);
        let masp = query.query.id
        let sql=`Delete from sanpham where MaSP='${masp}'`;
        await this.getSQL(sql);
        res.writeHead(301,{Location:'/admin/listProducts'});
        res.end();
    }



    async updateProduct(req,res){
        // sửa sản phẩm
        let html=await this.getTemplate('./Views/CRUD/update.html');
        let query=url.parse(req.url,true);
        let masp = query.query.id
        let sql=`SELECT * FROM sanpham where masp=${masp}`;
        let data= await this.getSQL(sql);

        html=html.replace('{masp}',data[0].MaSP);
        html=html.replace('{tensp}',data[0].TenSP);
        html=html.replace('{gia}',data[0].Gia);
        html=html.replace('{soluong}',data[0].Soluong);
        html=html.replace('{hinhanh}',data[0].Hinhanh);
        html=html.replace('{mota}',data[0].Mota);
        res.write(html);
        res.end();
    };

    async updateProductEdit(req,res) {
        let masp = '';
        // let query = url.parse(req.url,true);
        // let masp = qs.parse(query).masp;
        let Form=new formidable.IncomingForm();
        Form.uploadDir='./upload/';
        Form.parse(req,async(err,fields,files)=>{

            let newProduct={
                masp:fields.masp,
                name:fields.name,
                price:fields.price,
                quantity:fields.quantity,
                img:files.img.originalFilename,
                describe:fields.describe
            };
            let sql;
            if(newProduct.img){
                sql  = `update sanpham set tensp='${newProduct.name}',gia='${newProduct.price}',soluong='${newProduct.quantity}',hinhanh='${newProduct.img}',mota='${newProduct.describe}' where masp='${newProduct.masp}'`
                let tmpPath = files.img.filepath;
                let desPath = Form.uploadDir + files.img.originalFilename;
                fs.rename(tmpPath, desPath, (err) => {
                    if (err) console.log(err);
                });
            }
            else {
                sql  = `update sanpham set tensp='${newProduct.name}',gia='${newProduct.price}',soluong='${newProduct.quantity}',mota='${newProduct.describe}' where masp='${newProduct.masp}'`
            }
            await this.getSQL(sql);


            res.writeHead(301, { Location: "/admin/listProducts" });
            res.end();
        })
    };

    async login(req,res){
        if(req.method==='GET'){
            let html = await this.getTemplate('./Views/Login.html');
            res.write(html);
            return res.end();
        }else{
            let data = '';
            req.on('data', chunk => {
                data += chunk
            })
            req.on('end', async () => {
                let dataForm = qs.parse(data);

                let sql = `SELECT * FROM taikhoan WHERE TenTK = '${dataForm.username}' AND Matkhau = '${dataForm.password}'`;
                let result = await this.getSQL(sql);

                if (result.length == 0) {
                    res.writeHead(301, {Location: '/login'})
                    return res.end();
                } else {
                    if (result[0].Vaitro == '1'){
                        let nameFileSessions = result[0].TenTK + '.txt';
                        let dataSession = JSON.stringify(result[0]);
                        await this.writeFile('./sessions/' + nameFileSessions, dataSession)
                        res.setHeader('Set-Cookie','u_user=' + result[0].TenTK);
                        res.writeHead(301, {Location: '/admin'});
                        return res.end()
                    }
                    else if (result[0].Vaitro == '2') {
                        let nameFileSessions = result[0].TenTK + '.txt';
                        let dataSession = JSON.stringify(result[0]);
                        await this.writeFile('./sessions/' + nameFileSessions, dataSession)
                        res.setHeader('Set-Cookie','u_user=' + result[0].TenTK);
                        res.writeHead(301, {Location: '/user'});
                        return res.end()

                    }
                }
            })
        }
    }

    async showListUsers(req, res){
        let html = await this.getTemplate('./Views/users/list.html');
        let sql = 'SELECT MaTK,TenTK, TenKH,DiaChi, Dienthoai FROM taikhoan';
        let user = await this.getSQL(sql);
        let newHTML = '';
        user.forEach((user) => {
            newHTML += '<tr>';
            newHTML += `<td>${user.TenTK}</td>`;
            newHTML += `<td>${user.TenKH}</td>`;
            newHTML += `<td>${user.DiaChi}</td>`;
            newHTML += `<td>${user.Dienthoai}</td>`;
            newHTML += `<td><a onclick="return confirm('Bạn xác nhận xóa người dùng này?')" href="/admin/deleteUsers?id=${user.MaTK}" class="btn btn-danger">Xóa</a></td>`;
            newHTML += '</tr>';
        });
        html = html.replace('{list-user}', newHTML)
        res.write(html)
        res.end();
    }
    async deleteUser(req,res){
        //xoa user
        let query=url.parse(req.url,true);
        let matk = query.query.id
        let sql=`Delete from taikhoan where MaTk='${matk}'`;
        await this.getSQL(sql);
        res.writeHead(301, {Location: '/admin/listUsers'})
        res.end();
    }

    async Search(req,res){
        let html=await this.getTemplate('./Views/search/search.html');
        let query=url.parse(req.url,true);
        let sp=query.query.search;
        let sql=`SELECT tensp,gia,soluong,hinhanh,mota 
                  from sanpham 
                  where tensp like '%${sp}%' `;
        let listProduct=await this.getSQL(sql);
        let newHtml='';
        listProduct.forEach((product)=>{
            newHtml+=`<div class="col-3 text-center py-3">
            <div>
                <img src="/upload/${product.hinhanh}" style="width: 150px; height:150px; object-fit:cover">
            </div>
            <div class="text-center ">
                <p>${product.tensp}</p>
                <p>${product.gia} VNĐ</p>
                <button type="button" class="btn btn-outline-primary">Thêm vào giỏ hàng</button>
            </div>
        </div>`
        })
        // lay data sql thay doi html
        html = html.replace('{product-list}', newHtml)
        res.write(html)
        res.end();
    }


    async searchUsers(req,res){
        let html=await this.getTemplate('./Views/users/adminUser/searchUser.html');
        let query=url.parse(req.url,true);
        let ten=query.query.search;
        let sql=`SELECT MaTK,TenTK, TenKH,DiaChi, Dienthoai 
                  from taikhoan 
                  where TenKH like '%${ten}%' `;
        let User=await this.getSQL(sql);
        let newHTML = '';
        User.forEach((User) => {
            newHTML += '<tr>';
            newHTML += `<td>${User.MaTK}</td>`;
            newHTML += `<td>${User.TenTK}</td>`;
            newHTML += `<td>${User.TenKH}</td>`;
            newHTML += `<td>${User.DiaChi}</td>`;
            newHTML += `<td>${User.Dienthoai}</td>`;
            newHTML += `<td><a onclick="return confirm('Bạn xác nhận xóa người dùng này?')" href="/admin/deleteUsers?id=${User.MaTK}" class="btn btn-danger">Xóa</a></td>`;
            newHTML += '</tr>';
        });
        html = html.replace('{list-user}', newHTML)
        res.write(html)
        res.end();
    }

    async searchProductUser(req,res){
        let html=await this.getTemplate('./Views/users/user/searchProduct.html');
        let query=url.parse(req.url,true);
        let sp=query.query.search;
        let sql=`SELECT tensp,gia,soluong,hinhanh,mota 
                  from sanpham 
                  where tensp like '%${sp}%' `;
        let listProduct=await this.getSQL(sql);
        let newHtml='';
        listProduct.forEach((listProduct)=>{
            newHtml+=`<div class="col-3 text-center py-3">
            <div>
                <img src="/upload/${listProduct.hinhanh}" style="width: 150px; height:150px; object-fit:cover">
            </div>
            <div class="text-center ">
                <p>${listProduct.tensp}</p>
                <p>${listProduct.gia} VNĐ</p>
                <button type="button" class="btn btn-outline-primary">Thêm vào giỏ hàng</button>
            </div>
        </div>`
        })
        html = html.replace('{product-list}', newHtml)
        res.write(html)
        res.end();
    }

    async searchProductAdmin(req,res){
        let html=await this.getTemplate('./Views/users/adminUser/searchProduct.html');
        let query=url.parse(req.url,true);
        let sp=query.query.search;
        let sql=`SELECT MaSP,tensp,gia,soluong,hinhanh,mota
                  from sanpham 
                  where tensp like '%${sp}%' `;
        let Product=await this.getSQL(sql);
        let newHtml='';
        Product.forEach((Product)=>{
            newHtml+=`<tr>`
            newHtml+=`<td>${Product.tensp}</td>`
            newHtml+=`<td>${Product.gia}</td>`
            newHtml+=`<td>${Product.soluong}</td>`
            newHtml+=`<td><img width="150" height="150" src="/upload/${Product.hinhanh}"</td>`
            newHtml+=`<td>${Product.mota}</td>`
            newHtml+=`<td><a onclick="return confirm('Bạn chắc muốn xóa sản phẩm này?')" href="/admin/delete?id=${Product.MaSP}" class="btn btn-danger">Xóa</a>`
            newHtml+=`<td><a onclick="return " href="/admin/update?id=${Product.MaSP}" class="btn btn-primary">Sửa</a>`
            newHtml+=`</tr>`
        })
        html=html.replace('{product-list}',newHtml);
        res.write(html);
        res.end();
    }


};
module.exports=new Handle();