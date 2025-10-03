export const getDiscount = (price, discountPrice) => {
    return (((price - discountPrice) / price) * 100).toFixed();
};

export const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(new Date().getDate() + 7);
    return deliveryDate.toUTCString().substring(0, 11);
};

export const formatDate = (dt) => {
    return new Date(dt).toUTCString().substring(0, 16);
}; 

export const getRandomProducts = (prodsArray, n) => {
    return prodsArray.sort(() => 0.5 - Math.random()).slice(0, n);
};


// utils/functions.js

// Format date function (if not already present)
export const formatDate2 = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Calculate delivery date estimate
export const getExpectedDeliveryDate = (orderDate, daysToAdd = 7) => {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + daysToAdd);
  return formatDate(date);
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    'Confirmed': 'blue',
    'Processing': 'purple',
    'Shipped': 'orange',
    'Out For Delivery': 'yellow',
    'Delivered': 'green',
    'Cancelled': 'red',
    'Returned': 'gray'
  };
  return colors[status] || 'gray';
};