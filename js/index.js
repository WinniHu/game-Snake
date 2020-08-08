var sw = 20,    //方块宽带
    sh = 20,    //方块高度
    tr = 30,    //行数
    td = 30;    //列数
var snake =null;    //蛇的实例对象
    food = null;    //食物的实例
    game = null;    //游戏的实例
// 方块函数
function Square(x,y,classname){
    // 真实坐标与变量x的关系
    // 0，0     0，0
    // 20，0     1，0
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;
    this.viewContent = document.createElement('div');   //方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap'); //方块的父级
}
Square.prototype.create = function() {  //创建方块DOM
    this.viewContent.style.position='absolute';
    this.viewContent.style.width = sw +'px';
    this.viewContent.style.height = sh +'px';
    this.viewContent.style.top = this.y +'px';
    this.viewContent.style.left = this.x +'px';

    this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function() {
    this.parent.removeChild(this.viewContent);
};

// 蛇的构造函数
function Snake() {
    this.head = null;   //存一下蛇头信息
    this.tail = null;   //存一下蛇尾信息
    this.pos = [];  //存储蛇身上的每个方块的位置
    this.directionNum = {   //存储蛇走的方向
        left:{
            x:-1,
            y:0,
            rotate:180  //蛇头在不同方向中应该旋转，否则始终朝右
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
}

Snake.prototype.init = function () {
    // 创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    // console.log(1)
    snakeHead.create();
    this.head = snakeHead;  //存储蛇头信息
    this.pos.push([2,0]);   //存储蛇头位置

    // 创建蛇身1
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);   //存储蛇身1的坐标
    // 创建蛇身2
    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0,0]);   //存储蛇身2的坐标

    // 形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加方向属性，默认向右走
    this.direction = this.directionNum.right;
};

// 获取蛇头的下一个位置对应的元素，根据元素做不同的操作
Snake.prototype.getNextPos = function (){
    var nextPos = [    //蛇头的下一个点坐标
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ];
    // console.log(this.nextPos)

    // 下个点是自己，撞到自己，gameover
    var selfCollied = false;    //是否撞到自己
    this.pos.forEach(function(value) {
        if(value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    });
    if(selfCollied) {
        // console.log('撞自己了');
        this.strategies.die.call(this);
        return;
    }
    // 下个点是墙，gameover
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 ||nextPos[1]>tr-1) {
        console.log('撞墙');
        this.strategies.die.call(this);
        return;
    }
    // 下个点是食物，吃
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]) {
        // 若条件成立，表示蛇头的下一个点是食物苹果
        console.log('吃苹果啦')
        this.strategies.eat.call(this);
        return;
    }

    // 下个点没有东西，走
    this.strategies.move.call(this);
};

// 处理碰撞后要做的事情
Snake.prototype.strategies = {
    move:function(format) { //format决定是否删除最后一个方块(蛇尾)
        // 创建新身体（在旧蛇头位置）
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        // 更新链表关系
        newBody.next = this.head.next;
        newBody.last = null;
        newBody.next.last = newBody;
        this.head.remove(); //把旧蛇头从原来位置删除
        newBody.create();

        // 创建新蛇头(蛇头下一个要走的点)
        var newHead = new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
        // 更新列表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
        newHead.create();

        // 蛇身上的每个方块坐标要更新(二维数组前插入坐标，unshift也可以)
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
        this.head = newHead;    //蛇头this.head信息更新

        if(!format) {   //若format为false，表示需要删除蛇尾；吃苹果不删
            this.tail.remove();
            this.tail = this.tail.last;

            this.pos.pop();
        }
    },
    eat:function(){
        this.strategies.move.call(this,true);
        createFood();
        game.score++;
    },
    die:function(){
        // console.log('die')
        game.over();
    }
}


snake = new Snake();


// 创建食物
function createFood() {
    var x = null;
    var y = null;

    var include = true;
    if(include) {
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(tr-1));

        snake.pos.forEach(function(value) {
            if(x!=value[0] && y != value[1]) {
                include = false;
            }
        })
    }
    food = new Square(x,y,'food');
    food.pos = [x,y];   //存储食物的坐标，用于跟蛇头要走的下一个点做对比
    var foodDom = document.querySelector('.food');
    if(foodDom) {
        foodDom.style.left = x*sw +'px';
        foodDom.style.top = y*sh +'px';
    }else{
        food.create();
    }
    
};


// 创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init=function() {
    snake.init();
    createFood();

    document.onkeydown=function(ev) {
        // console.log(ev.keyCode)
        // console.log(snake.direction);
        if(ev.keyCode == 37 && snake.direction!= snake.directionNum.right) {
            // 用户按下左方向键，此时蛇不能正往右走
            snake.direction = snake.directionNum.left;
        }else if(ev.which == 38 && snake.direction!= snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if(ev.which == 39 && snake.direction!= snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(ev.which == 40 && snake.direction!= snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();
};
//开始游戏
Game.prototype.start=function() {   
    this.timer = setInterval(function(){
        snake.getNextPos();
    },200)
};
// 暂停
Game.prototype.pause=function(){
    clearInterval(this.timer);
}
// 游戏结束
Game.prototype.over=function() {
    clearInterval(this.timer);
    alert('您的得分为:'+ this.score);

    // 游戏回到最初始状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';

    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}


// 开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick=function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
}

// 暂停游戏
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function() {
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
};
pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}