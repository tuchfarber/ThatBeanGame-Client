let game = new Vue({
    el: "#content",
    data: {
        hand: [
            {name:"Black Bean",img_url:"http://via.placeholder.com/100x75",values:[2,4,5,6]},
            {name:"Coffee Bean",img_url:"http://via.placeholder.com/100x75",values:[1,2,3,4]},
            {name:"Blue Bean",img_url:"http://via.placeholder.com/100x75",values:[5,6,9,10]},
            {name:"Wax Bean",img_url:"http://via.placeholder.com/100x75",values:[6,8,10,12]},
            {name:"Green Bean",img_url:"http://via.placeholder.com/100x75",values:[2,4,5,6]},
            {name:"Blue Bean",img_url:"http://via.placeholder.com/100x75",values:[5,6,9,10]},
            {name:"Wax Bean",img_url:"http://via.placeholder.com/100x75",values:[6,8,10,12]},
            {name:"Red Bean",img_url:"http://via.placeholder.com/100x75",values:[1,2,3,4]},
            {name:"Green Bean",img_url:"http://via.placeholder.com/100x75",values:[2,4,5,6]},
            {name:"Blue Bean",img_url:"http://via.placeholder.com/100x75",values:[5,6,9,10]},],
        players:['a','b','c','d','e','f'],
        fields:['x','y','z'],
        market:[1,2]
    },
    methods:{
    }
})