const express=require('express')
const route=express.Router()
const admincontroller=require('../controllers/AdminController')
const menucontroller=require('../controllers/MenuController')
const authMiddleware=require('../Middleware/AuthMiddleware')
const upload=require("../Middleware/UploadMiddleware")
const Openinghourscontrollers=require("../controllers/OpeninghoursControllers")
const SpecialHoursController=require('../controllers/SpecialHoursController')
const RestaurantConfiguration=require('../controllers/RestaurantConfigController')
const reservationController=require('../controllers/Reservation')
const BlogController=require('../controllers/BlogController')
const CategoryController=require('../controllers/CategoryController')

//admin

route.post('/api/login',admincontroller.loginAdmin)


//admin -- add menu
route.post("/api/addmenu", authMiddleware, upload.single("image"), menucontroller.addMenu)
//get menu
route.get("/api/getmenu", menucontroller.getMenu)
//admin--edit menu
route.put("/api/editmenu/:id", authMiddleware, upload.single("image"), menucontroller.updateMenu)
//admin--delete menu
route.delete("/api/deletemenu/:id", authMiddleware, menucontroller.deleteMenu)
// get single menu
route.get("/api/getmenu/:id",authMiddleware, menucontroller.getSingleMenu)

//opening hours

route.post("/api/createopening-hours", authMiddleware,Openinghourscontrollers.createOpeningHours)

route.get("/api/getopening-hours", Openinghourscontrollers.getOpeningHours)
route.put(
  "/api/opening-hours",
  authMiddleware,
  Openinghourscontrollers.updateOpeningHours
)


//special hrs


route.post("/api/special-hours",authMiddleware,SpecialHoursController.createSpecialHours)

route.get("/api/getspecial-hours",SpecialHoursController.getSpecialHours)


//RestaurantConfigure

route.post("/api/createconfig",authMiddleware,RestaurantConfiguration.createConfig)

route.put("/api/updateconfig",authMiddleware,RestaurantConfiguration.updateConfig)

route.get("/api/getconfig",RestaurantConfiguration.getConfig)


//reservationRoutes

route.get("/api/slots",reservationController.getAvailableSlots)

route.post("/api/reservations",reservationController.createReservation)

route.get("/api/getreservations",reservationController.getReservations)

//blog

route.post("/api/createblog",authMiddleware,upload.single("image"), BlogController.createBlog);
route.put("/api/edit/:id",authMiddleware,upload.single("image"), BlogController.editBlog);
route.delete("/api/delete/:id",authMiddleware, BlogController.deleteBlog);
route.get("/api/view/:id", BlogController.viewBlog);
route.get("/api/list", BlogController.listBlogs);


//category

route.post("/api/category", authMiddleware, CategoryController.createCategory)
route.get("/api/categories", CategoryController.getCategories)
route.put("/api/category/:id", authMiddleware, CategoryController.updateCategory)
route.delete("/api/category/:id", authMiddleware, CategoryController.deleteCategory)


//user


route.get("/api/categories", CategoryController.getCategories)
route.get("/api/menu", menucontroller.getMenu)
route.get("/api/opening-hours", Openinghourscontrollers.getOpeningHours)
route.get("/api/special-days",SpecialHoursController.getSpecialHours)
route.get("/api/blogs", BlogController.listBlogs)


module.exports=route