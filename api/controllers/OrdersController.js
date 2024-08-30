const Order = require("../models/orderModel");
const Service = require("../models/serviceModel");
const { getServiceRating } = require("./TestimonialsController");
const { findServiceById } = require("./ServicesController");
const { findUserById } = require("./UserController");

const findUserServices = async (userId) => {
  const user = await findUserById(userId);
  if (user) {
    const services = await Service.find({ userId }).sort({ updatedAt: -1 });
    let servicesInfos = [];
    for (let i of services) {
      const rating = await getServiceRating(i._id.toString());
      servicesInfos.push({ ...i._doc, serviceRating: rating });
    }
    return servicesInfos;
  }
  return null;
};

const findUsersServices = async () => {
  const services = await findServices();
  let servicesRatingAndUser = [];
  for (let i of services) {
    const rating = await getServiceRating(i._id.toString());
    const userInfo = await findUserById(i.userId);
    servicesRatingAndUser.push({ ...i._doc, serviceRating: rating, userInfo });
  }
  return servicesRatingAndUser;
};


const findOrder = async (orderId) => {
  const selectedOrder = Order.findById(orderId);
  return selectedOrder;
};

const findClientOrders = async (clientId) => {
  const selectedClient = await findUserById(clientId);
  if (selectedClient) {
    if (selectedClient.role != "client") {
      return "You Don't Have Permission";
    }
    const clientOrders = await Order.find({ clientId }).sort({ updatedAt: -1 });
    if (clientOrders.length != 0) {
      let allOrdersInfo = [];
      for (let i of clientOrders) {
        const serviceInfo = await findServiceById(i.serviceId.toString());
        const serviceRating = await getServiceRating(i.serviceId.toString());
        const serviceUserInfo = await findUserById(serviceInfo.userId);
        const ordersInfo = {
          serviceInfo,
          serviceRating,
          serviceUserInfo,
          status: i.status,
          _id: i._id,
        };
        allOrdersInfo.push(ordersInfo);
      }
      return allOrdersInfo;
    }
    return [];
  }
  return "User Doesn't Exists";
};

const findClientOrder = async (clientId, orderId) => {
  const selectedClient = await findUserById(clientId);
  if (selectedClient) {
    if (selectedClient.role != "client") {
      return "You Don't Have Permission";
    }
    const clientOrder = await findOrder(orderId);
    if (clientOrder) {
      const serviceInfo = await findServiceById(
        clientOrder.serviceId.toString()
      );
      const serviceRating = await getServiceRating(
        clientOrder.serviceId.toString()
      );
      const serviceUserInfo = await findUserById(serviceInfo.userId);
      const orderInfo = {
        serviceInfo,
        serviceRating,
        serviceUserInfo,
        status: clientOrder.status,
        _id: clientOrder._id,
      };
      return orderInfo;
    }
    return "Order Doesn't Exists";
  }
  return "User Doesn't Exists";
};
const findServices = async () => {
  const services = await Service.find();
  return services;
};
const createService = async (title, description, price, userId, images) => {
  const oldService = (await findServices()).find(
    (service) => service.title == title && service.userId == userId
  );
  if (oldService) {
    return null;
  }
  const createdService = await Service.create({
    title,
    description: description,
    price,
    images: images.join("|"),
    userId,
  });
  return createdService;
};


const makeOrder = async (clientId, serviceId) => {
  const selectedClient = await findUserById(clientId);
  if (selectedClient) {
    if (selectedClient.role != "client") {
      return "You Don't Have Permission";
    }
    const selectedService = await findServiceById(serviceId);
    if (selectedService) {
      const orderExists = await Order.find({
        clientId: selectedClient._id,
        serviceId: selectedService._id,
        status: "OnGoing",
      });
      if (orderExists.length != 0) {
        return "You Already Have A Uncompleted Order For This Service";
      }
      // const text = `Hello,I would like to order ${selectedService.title} service`;
      // sendMessage(clientId, selectedService.userId, text);
      const createdOrder = Order.create({
        clientId: selectedClient._id,
        serviceId: selectedService._id,
      });
      return "Order Made Successfully";
    }
    return "Service Doesn't Exists";
  }
  return "User Doesn't Exists";
};

const applyJob = async (Id, serviceId) => {
  const selectedFree = await findUserById(Id);
  if (selectedFree) {
    if (selectedFree.role != "freelancer") {
      return "You Don't Have Permission";
    }
    const selectedJob = await findServiceById(serviceId);
    if (selectedJob) {
      const orderExists = await Order.find({
        clientId: selectedFree._id,
        serviceId: selectedJob._id,
        status: "OnGoing",
      });
      if (orderExists.length != 0) {
        return "You Already Have A Uncompleted Order For This Service";
      }
      // const text = `Hello,I would like to order ${selectedService.title} service`;
      // sendMessage(clientId, selectedService.userId, text);
      const createdOrder = Order.create({
        clientId: selectedFree._id,
        serviceId: selectedJob._id,
      });
      return "Order Made Successfully";
    }
    return "Service Doesn't Exists";
  }
  return "User Doesn't Exists";
};

const updateOrder = async (clientId, orderId, orderState) => {
  const selectedClient = await findUserById(clientId);
  if (selectedClient) {
    if (selectedClient.role != "client") {
      return "You Don't Have Permission";
    }
    const selectedOrder = await findOrder(orderId);
    if (selectedOrder) {
      if (selectedOrder.clientId.toString() != clientId) {
        return "You Don't Have Permission";
      }
      if (orderState != "Completed" && orderState != "Cancelled") {
        return "Order Status Unrecognized";
      }
      const updatedOrder = Order.updateOne(
        { clientId, _id: orderId, status: "OnGoing" },
        {
          status: orderState,
        }
      );
      return updatedOrder;
    }
    return "Order doesn't exists";
  }
  return "User doesn't exists";
};

module.exports = {
  findUsersServices,
  findClientOrder,
  findClientOrders,
  makeOrder,
  updateOrder,
  findOrder,
  createService,
  applyJob

};
