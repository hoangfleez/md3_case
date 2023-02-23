const http = require('http');
const url = require("url");
const Handle = require('./Controller/Handles/Handle')
const fs = require("fs");

const server = http.createServer((req, res) => {

    let mimeTypes = {
        'jpg': 'images/jpg',
        'png': 'images/png',
        'js': 'text/javascript',
        'css': 'text/css',
        'svg': 'image/svg+xml',
        'ttf': 'font/ttf',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'eot': 'application/vnd.ms-font-object'
    }

    let urlPath = url.parse(req.url).pathname;
    const filesDefences = urlPath.match(/\.js|\.css|\.png|\.svg|\.jpg|\.ttf|\.woff|\.woff2|\.eot/);
    if (filesDefences) {
        const extension = mimeTypes[filesDefences[0].toString().split('.')[1]];
        res.writeHead(200, {'Content-Type': extension});
        fs.createReadStream(__dirname + req.url).pipe(res)
    } else {
        switch (urlPath) {
            //Trang chủ
            case '/':
                Handle.homepage(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/product':
                Handle.showProductHomepage(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/search':
                Handle.Search(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                // Đăng nhập
            case '/login':
                Handle.login(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                //Tạo tài khoản
            case '/register':
                Handle.register(req, res).catch(err=>{
                    console.log(err.message);
                })
                break;
                //Tài khoản người dùng
            case '/user':
                Handle.userHomepage(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                //Hiển thị sản phẩm trang người dùng
            case '/user/product':
                Handle.showProductUser(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/user/search':
                Handle.searchProductUser(req, res).catch(err => {
                    console.log(err.message);
                });
                break;


                //----- Trang admin-----
            case '/admin':
                Handle.adminHomepage(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                // Thêm sản phẩm từ trang admin
            case '/admin/add':
                Handle.addProduct(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                // Hiện ds sản phẩm
            case '/admin/listProducts':
                Handle.showAdminProduct(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                // Xóa sản phẩm
            case '/admin/delete':
                Handle.deleteProduct(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                // Sửa thông tin sản phầm (admin)
            case '/admin/update':
                Handle.updateProduct(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/admin/edit':
                Handle.updateProductEdit(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
                //Hiện thông tin người dùng
            case '/admin/listUsers':
                Handle.showListUsers(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/admin/deleteUsers':
                Handle.deleteUser(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/searchUsers':
                Handle.searchUsers(req, res).catch(err => {
                    console.log(err.message);
                });
                break;
            case '/searchProduct':
                Handle.searchProductAdmin(req, res).catch(err => {
                    console.log(err.message);
                });
                break;







            default:
                res.end();

        }
    }


});

server.listen(8000, () => {
    console.log('Server is running at localhost:8000');
})