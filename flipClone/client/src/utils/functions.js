export const getDiscount = (price, discountPrice) => {
    return (((price - discountPrice) / price) * 100).toFixed();
};

export const getRandomProducts = (prodsArray, n) => {
    return prodsArray.sort(() => 0.5 - Math.random()).slice(0, n);
};

export const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(new Date().getDate() + 7);
    return deliveryDate.toUTCString().substring(0, 11);
};

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

// format date functions:
export const formatDate = (dt) => {
    return new Date(dt).toUTCString().substring(0, 16);
}; 

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

export const formatDate3 = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
  };
  return date.toLocaleDateString('en-IN', options);
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-IN', options);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};