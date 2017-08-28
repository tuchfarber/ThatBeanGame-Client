let game = new Vue({
    el: "#content",
    data: {
        base_url: location.protocol + '//' + window.location.hostname + ':' + location.port,
        game_type: "public",
        game_id:"",
        player_info: {},
        game_info: {},
        players: ['a','b','c','d','e','f'],
        market: [],
        trades: [],


        hand: [
            {name:"Black Bean",img_url:"assets/beans/black.png",values:[2,4,5,6]},
            {name:"Coffee Bean",img_url:"http://via.placeholder.com/100x75",values:[1,2,3,4]},
            {name:"Blue Bean",img_url:"http://via.placeholder.com/100x75",values:[5,6,9,10]},
            {name:"Wax Bean",img_url:"http://via.placeholder.com/100x75",values:[6,8,10,12]},
            {name:"Green Bean",img_url:"http://via.placeholder.com/100x75",values:[2,4,5,6]},
            {name:"Cocoa Bean",img_url:"assets/beans/cocoa.png",values:[5,6,9,10]},
            {name:"Garden Bean",img_url:"assets/beans/garden.png",values:[6,8,10,12]},
            {name:"Red Bean",img_url:"assets/beans/red.png",values:[1,2,3,4]},
            {name:"Green Bean",img_url:"http://via.placeholder.com/100x75",values:[2,4,5,6]},
            {name:"Soy Bean",img_url:"assets/beans/soy.png",values:[5,6,9,10]},],
        market:[1,2]
    },
    methods:{
        checkAccess: function(){
            this.$http.get(
                this.base_url + '/api/access'
            )
            .then(response => {
                this.game_id = response.body.game;
                this.player_info.name = response.body.player_name;
                this.update();
                this.hideLogin();
                //window.setInterval(this.update(), 2000)
            }, response => {
                // Do nothing. We are just skipping auto login
            });
        },
        createGame: function(){
            if(!this.player_info.name){
                alert("Please enter a username");
                return;
            }
            this.$http.post(
                this.base_url + '/api/create',
                {"name":this.player_info.name},
                {"game_type":this.game_type}
            )
            .then(response => {
                this.game_id = response.body.game;
                this.update();
                this.hideLogin();
                //window.setInterval(() => this.update(), 2000)
            }, response => {
                alert(JSON.stringify(response.body))
            });
        },
        joinGame: function(){
            this.$http.post(
                this.base_url + '/api/login', 
                {"name":this.player_info.name, "game":this.game_id}
            )
            .then(response => {
                this.update();
                this.hideLogin();
                //window.setInterval(this.update(), 2000)
            }, response => {
                alert(JSON.stringify(response.body.error))
            });
        },
        update: function(){
            this.$http.get(
                this.base_url + '/api/game/' + this.game_id
            )
            .then(response => {
                let all_data = response.body;
                this.player_info = all_data.player_info;
                this.players = all_data.players;
                this.market = all_data.market;
                this.trades = all_data.trades;
                /*
                this.game_info 
                    "deck_count":144,
    "playthrough":0,
    "discard_count":0,
    "current_player":"Matt",
    "status":"Running",
    "game_id":"269fc8",
    "stage":"First Card"
                */
                this.player_info = all_data.player_info;
            }, response => {
                alert(JSON.stringify(response.body.error))
            });
        },
        hideLogin: function(){document.querySelector("#overlay").style.height=0}
    },
    mounted: function(){
        this.checkAccess();
    }
})