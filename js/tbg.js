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
        incoming_data: {},
        selected_card: '',
        selected_location: '',
        trade_selection_on: false,
        trade_selection_cards: []
    },
    computed:{
        clickable_objects: function (){
            objects = []
            if (this.game_state.current_player != this.player_state.name){return []}
            if (this.selected_card == '' && ['First Card', 'Second Card'].includes(this.game_state.stage)){
                objects.push('hand')
            }
            if (this.selected_card != ''){
                objects.push('field')
            }
            if (
                this.selected_card == '' && this.game_state.stage=='Post Market Flip'
                && this.game_state.market.length != 0
            ){
                objects.push('market')
            }
            if (
                ['Second Card','Pre Market Flip'].includes(this.game_state.stage)
                || (this.game_state.stage == 'Post Market Flip' && this.game_state.market.length==0)
            ){
                objects.push('deck')
            }
            return objects
        },
        prettyPlaythrough: function(){
            prettied = ['1st','2nd','3rd']
            return prettied[this.game_state.playthrough]
        },
        host: function(){
            host = '';
            if(this.player_state.is_host){host = this.player_state.name}
            this.game_state.players.forEach(function(player){
                if(player.is_host){host = player.name}
            })
            return host;
        }
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
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
            });
        },
        update: function(){
            axios({
                method: 'get',
                url: this.base_url + '/api/game/' + this.game_state.game_id,
                withCredentials: true
            })
            .then(response => {
                this.incoming_data = response.data;
                this.updateData(this.incoming_data)
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
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
            });
        },
        buyThirdField: function(){
            axios({
                method: 'post',
                url: this.base_url + '/api/game/' + this.game_state.game_id + '/buy',
                data: {},
                withCredentials: true
            })
            .then(response => {
                this.update();
            })
            .catch(error => {
                console.log(error.response.data.error)
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
                console.log(error.response.data.error)
            });
        },
        selectCard: function(location, card){
            if(this.trade_selection_on == true){
                this.trade_selection_cards.push(card.id)
                return
            }

            if(location=='hand'){
                this.selected_card = card.id;
                this.selected_location = 'hand';
            }else if(location=='market'){
                this.selected_card = card.id;
                this.selected_location = 'market';
            }
        },
        submitTrade: function(){
            continue
        },
        addSelectedCardToField: function(field){
            if(this.game_state.status != 'Running'){return}
            if(this.selected_location=='hand' && ['First Card', 'Second Card'].includes(this.game_state.stage)){
                this.playCardFromHand(field);
            }else if(this.selected_location=='market' && this.game_state.stage =='Post Market Flip'){
                this.playCardFromMarket(this.selected_card, field)
            }
            this.selected_card = ''
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
        updateData: function(new_data){
            Object.keys(this.game_state).forEach((key) => {
                this.game_state[key] = new_data[key];
            })
            this.player_state = new_data.player_info
        },
        exitGame: function(){
            document.cookie = "tbg_token=; expires=" + +new Date() + "; domain=" + window.location.hostname + "; path=/";
            location.reload();
        },
        isClickable: function(location, param){
            if (location == 'hand' && param != 0){return ''}
            if (location == 'field' && param == false){return ''}
            if (this.clickable_objects.includes(location)){
                return 'clickable';
            }
            return ''
        },
        hideLogin: function(){document.querySelector("#overlay").style.height=0}

    },
    mounted: function(){
        this.checkAccess();
    }
})