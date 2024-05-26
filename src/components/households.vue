<template>
     <div class="households">
         <ul>
             <li v-for="item in rdcordAyyy" :key='item.recordimg'>
               <router-link class="aLabel" :to="{path:'/householdsLists',query:{recorddate:item.recorddate,phone:item.userphone}}">
                    <div class="imgDoor">
                        <van-image
                            width="80px"
                            height="80px"
                            fit="cover"
                           :src="imgLocality+item.recordimg"
                            /> 
                    </div>

                    <div class="doorContent">
                        <h4>{{item.recordaddr}}</h4>
                        <p>{{item.recorddate}}</p>
                    </div>
                   </router-link>
                </li>
           
         </ul>
     </div><!--/households-->
</template>

<script>
import {apiUrl, filetest,getlisting} from '../utils/apiUrl'

export default {
    name:'households',

    data(){
        return{
            rdcordAyyy:[],
            imgLocality:process.env.BASE_URL_HTTPS+'images/',//拼接图片
        } 
    },
    mounted(){
        this.getUserInfo()
    },
    methods: {
       getUserInfo(){
         getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdindoorfindAll)
         .then(res=>{
              this.rdcordAyyy=res.data
         })
       }
     },
}
</script>

<style lang='scss' >
html,body{background: #f2f2f2; height: 100vh; }
     .households{
       padding:  2%;
        >ul{
            li{
             background: #fff; border-radius: 5px; margin:  0 0   10px 0; box-shadow:  0 2px 5px #e2e2e2;
               .aLabel{  display: flex; justify-content: space-between;  align-items: flex-start;  padding: 10px; }
                .imgDoor{  width: 80px; height: 80px;
                 //   >img{ width: 80px; height: 80px; display: block;}
                }
                .doorContent{
                     width: calc(100% - 90px);
                     >h4{ font-size: 16px; font-weight: 700; line-height: 25px; text-align: left; height: 50px;
                            text-overflow: -o-ellipsis-lastline;
                            overflow: hidden;			
                            text-overflow: ellipsis;	
                            display: -webkit-box;			
                            -webkit-line-clamp: 2;		
                            line-clamp: 2;					
                            -webkit-box-orient: vertical;
                            color: #333;	}
                     >p{ font-size: 12px; color: #666; text-align: right; height: 20px; line-height: 20px; margin: 10px 0 0 0;}
                }
            }
        }
     }//households
</style>