<template>
     <div>
         <div class="vanGrid" >  
               <div class="vanGridTitle"  ref="popupHeight"><img src="../assets/images/installer8.png"/> <span>错误日志</span></div>
        
                <div class="taskLis"  :style="`height:${contentHeight}px`" >
                         <div v-for="(item,index) in lists " :key='index'>
                              <div v-for="(itemChild,indexChild) in item" :key="indexChild"> 
                                 <p class="pText">{{itemChild}}</p>
                              </div>
                         </div>
                        
                </div><!--/taskLis-->

                 <div v-if="errorRiz">
                     <div class="nodate">
                          <img src="../assets/images/noDate.png" alt="">
                          <p>暂无错误日志！</p>
                     </div>
                </div>
         </div><!--/vanGrid-->

     </div>
</template>
<script>
import {apiUrl,getlisting} from '../utils/apiUrl'
export default {
    data(){
        return{
            contentHeight:0,
            screenHeight:0,
            lists:[],a:'',
            errorRiz:false
        }
    },
    mounted(){
         this.screenHeight = window.innerHeight;
         this.riderPopup()
         this.getLog()
    },
    methods:{
         riderPopup(){
            let that =this
              this.$nextTick(()=>{
                 let a =that.$refs.popupHeight.offsetHeight //标题高度
                 that.contentHeight=that.screenHeight-a
              })
          },
        getLog(){
             getlisting(process.env.BASE_URL_HTTPS_TWO+apiUrl.hxderrorfindAll)
            .then(res=>{
                  let lis = res.data
                  if(lis.length){
                        this.lists=lis.map(item=>{ //先去掉\&
                        // let errorinfo= JSON.stringify(item.errorinfo)
                            let errorinfo2= item.errorinfo
                            let arr;       
                            if(errorinfo2.indexOf('&')){
                            arr =  errorinfo2.split('&')
                            } 
                        // console.log(arr)
                            return arr
                        })
                  }else{
                     this.errorRiz=true
                  }
                  
            })
      
        }
           
    }
}
</script>

<style lang='scss' >
.taskLis{ width: 95%;  margin: auto;
     >div{ padding: 2%; border-radius: 5px; background: #f2f2f2; margin:  0 0 10px 0;}
 }
  .pText{  text-align: left; font-size: 14px; margin:  0 0  10px 0;} 
</style>