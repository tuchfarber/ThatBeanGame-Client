let game = new Vue({
    el: "#content",
    data: {
        base_url: location.protocol + '//' + window.location.hostname + ':8080',
        player_state: {
            coins: 0, 
            fields: [], 
            hand: [], 
            hand_count: 0, 
            is_host: null, 
            name: "", 
            pending_cards: []
        },
        game_state: {
            game_type: "public",
            current_player: "", 
            deck_count: 0,
            discard_count: 0, 
            market: [],
            players: [],
            playthrough: 0, 
            stage: "", 
            status: "", 
            trades: [],
            game_id: "",
        },
        selected_card: '',
        selected_location: ''
    },
    methods:{
        checkAccess: function(){
            axios({
                method: 'get',
                url: this.base_url + '/api/access',
                withCredentials: true
            })
            .then(response => {
                this.game_state.game_id = response.data.game;
                this.player_state.name = response.data.player_name;
                this.update();
                this.hideLogin();
                //setInterval(() => {this.update()}, 5000)
            })
            .catch(error => {
                console.log("Could not login with cookie")
            });
        },
        createGame: function(){
            if(!this.player_state.name){
                alert("Please enter a username");
                return;
            }
            axios({
                method: 'post',
                url: this.base_url + '/api/create',
                data: {
                    name: this.player_state.name,
                    game_type: this.game_state.game_type
                },
                withCredentials: true
            })
            .then(response => {
                console.log(response);
                this.game_state.game_id = response.data.game;
                this.update();
                this.hideLogin();
                setInterval(() => {this.update()}, 5000)
            })
            .catch(error => {
                console.log(error)
            });
        },
        joinGame: function(){
            axios({
                method: 'post',
                url: this.base_url + '/api/login',
                data: {
                    name: this.player_state.name,
                    game:this.game_state.game_id
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
                this.hideLogin();
                setInterval(() => {this.update()}, 5000)
            })
            .catch(error => {
                console.log(error)
            });
        },
        startGame: function(){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/start',
                data: {
                    "name":this.player_state.name,
                    "game":this.game_state.game_id
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        update: function(){
            axios({
                method: 'get',
                url: this.base_url + '/api/game/' + this.game_state.game_id,
                withCredentials: true
            })
            .then(response => {
                all_data = response.data;
                Object.keys(this.game_state).forEach((key) => {
                    this.game_state[key] = all_data[key];
                })
                this.player_state = all_data.player_info
            })
            .catch(error => {
                console.log("Failed to retrieve  or extract game data")
            });
            switch(this.game_state.stage){
                case "First Card":
                    this.usable_locations = ['hand', 'field'];
                    break;
                case "Second Card":
                    this.usable_locations = ['hand', 'deck'];
                    break;
                case "Pre Market Flip":
                    this.usable_locations = ['deck']
                    break;
                case "Post Market Flip":
                    this.usable_locations = ['market', 'trade',]

            }
        },
        playCardFromHand: function(field){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/play/hand',
                data: {
                    "field_index": field
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        playCardFromMarket: function(card_id, field){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/play/market',
                data: {
                    "field_index": field,
                    "card_id": card_id
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error.response.data.error)
            });
        },
        playCardFromPending: function(card_id, field){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/play/pending',
                data: {
                    "field_index": field,
                    "card_id": card_id
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        drawCardsToMarket: function(){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/draw/market',
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        drawCardsToHand: function(){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/draw/hand',
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        createTrade: function(ids, other_players, wants){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/trade/create',
                data: {
                    "card_ids":ids,
                    "other_player":other_players,
                    "wants":wants
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        acceptTrade: function(trade_id, card_ids){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/trade/accept',
                data: {
                    "trade_id":trade_id,
                    "card_ids":card_ids
                },
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error)
            });
        },
        selectCard: function(location, card){
            if(location=='hand'){
                this.selected_card = card.id;
                this.selected_location = 'hand';
            }else if(location=='market'){
                this.selected_card = card.id;
                this.selected_location = 'market';
            }
        },
        addSelectedCardToField: function(field){
            if(game.game_state.status != 'Running'){return}
            if(this.selected_location=='hand' && ['First Card', 'Second Card'].includes(this.game_state.stage)){
                this.playCardFromHand(field);
            }else if(this.selected_location=='market' && this.game_state.stage =='Post Market Flip'){
                this.playCardFromMarket(this.selected_card, field)
            }
            this.update();
        },
        useDeck: function(){
            if(game.game_state.status != 'Running'){return}
            if(['Second Card','Pre Market Flip'].includes(this.game_state.stage)){
                this.drawCardsToMarket();
            }else if(this.game_state.stage == 'Post Market Flip'){
                this.drawCardsToHand()
            }
        },
        exitGame: function(){
            document.cookie = "tbg_token=; expires=" + +new Date() + "; domain=" + window.location.hostname + "; path=/";
            location.reload();
        },
        isClickable: function(location){
            if(location == 'hand' && ['First Card', 'Second Card'].includes(this.game_state.stage)){return 'clickable'}
            if(location == 'market' && this.game_state.stage=='Post Market Flip'){return 'clickable'}
            if(location == 'field' && ['First Card', 'Second Card', 'Post Market Flip'].includes(this.game_state.stage)){return 'clickable'}
            if(location == 'deck' && ['Second Card','Pre Market Flip', 'Post Market Flip'].includes(this.game_state.stage)){return 'clickable'}
            return ''
        },
        hideLogin: function(){document.querySelector("#overlay").style.height=0}

    },
    mounted: function(){
        this.checkAccess();
    }
})