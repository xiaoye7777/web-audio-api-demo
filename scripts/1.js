let fileList = [];
    let loadFile = function (files) {
      console.log(files)
      let file = files[0]
      for (let i = 0; i < fileList.length; i++) {
        if (file.name === fileList[i].name) {
          return
        }
      }
      fileList.push({
        num:fileList.length + 1,
        name:file.name
      })

      let liEl = document.createElement('li')

      liEl.addEventListener('click',function() {
        //播放音乐
        play(file)
        selected(liEl)
      })

      
      //每条歌曲的序号
      let numSpanEl = document.createElement('span')
      numSpanEl.classList.add('num')
      numSpanEl.innerHTML = fileList.length
      liEl.append(numSpanEl)

      //每条歌曲的 歌曲名
      let nameSpanEl = document.createElement('span')
      nameSpanEl.classList.add('song')
      nameSpanEl.innerHTML = file.name
      liEl.append(nameSpanEl)

      //把li加到ul上
      let fileListEl = document.getElementById('fileList');
      fileListEl.append(liEl)

      //选中高亮
      let selected = function (selectedEl) {
        let lis = document.querySelector('#fileList').children
        
        for (let i = 0; i < fileList.length; i++) {
          lis.item(i).lastChild.classList.remove('selected')
        }
        selectedEl.lastChild.classList.add('selected')
      }
    }

    //用web audio接口 播放音乐
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let audioBufferSourceNode = null;
    let analyser = audioCtx.createAnalyser();
    let play = function (file) {
      let fileReader = new FileReader();
      fileReader.onload = function(e) {
        audioCtx.decodeAudioData(e.target.result).then(function(buffer){
          if (audioBufferSourceNode != null) {
            audioBufferSourceNode.stop()
          }
          audioBufferSourceNode = null;
          audioBufferSourceNode = audioCtx.createBufferSource();
          audioBufferSourceNode.buffer = buffer;
          audioBufferSourceNode.connect(audioCtx.destination);
          audioBufferSourceNode.connect(analyser);
          audioBufferSourceNode.loop = true;
          audioBufferSourceNode.start(0)
        })
        getMusicData()
      }
      fileReader.readAsArrayBuffer(file);
    }

    //加载音乐波形分析器
    let getMusicData = function () {
      webkitRequestAnimationFrame(getMusicData)
      const audioInfoArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(audioInfoArray);
      console.log(audioInfoArray);
      animeDiv(audioInfoArray)
    }

    //开始做可视化特效部分
    //初始化div：1.获取整个圆圈大的div，2.动态创建小的div(微分),3.添加属性
    let initDiv = function(num, r) { //num是指定要创建多少个小div, r是半径
      const winWidth = document.documentElement.clientWidth;
      const winHeight = document.documentElement.clientHeight;
      const avd = 360/num;            //小div的角度
      const ahd = avd * Math.PI/180   //转为弧度，角度*1°对应的弧度
      let stageDivEl = document.querySelector('.stage')
      for(let i = 0; i < num; i++) {
        let divEl = document.createElement('div')
        divEl.classList.add('el')
        stageDivEl.append(divEl)
        //console.log("这里这里")
        //divEl.innerHTML = i
        anime({
          
          targets:divEl,
          translateX:[winWidth / 2, winWidth / 2 + Math.sin(ahd * i) * r],
          translateY:[winHeight / 2, winHeight / 2 + Math.cos(ahd * i) * r],
          loop:false,
          duration:100,
          rotate:[-(avd * i)],
        })
        //console.log("这里这里2")
      }
    }
    initDiv(60, 100)

    //形成动画 根据音频数据更改div的高度
    let animeDiv = function(audioInfoArray) {
      let stageDivEl = document.querySelector('.stage');
      for(let i = 0; i < stageDivEl.children.length; i++) {
        anime({
          targets:stageDivEl.children[i],
          height:[audioInfoArray[i] / 2],
          duration:1000
        })
      }

    }