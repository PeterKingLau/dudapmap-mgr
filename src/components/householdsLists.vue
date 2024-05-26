<template>
     <div class="houserholdsLists">
          <div v-if="lists.length">
            <div class="lis" v-for="(item,index) in  lists" :key="item.recordimg">
                <!--删除按钮-->
                <div class="close"><img src="../assets/images/del.png" alt="" @click="del(index,item.id)"></div>
                <ul>
                    <li>
                            <span>门牌图片:</span>
                            <div>
                                <van-image
                                    width="80px"
                                    height="80px"
                                    fit="cover"
                                    :src="imgLocality+item.recordimg"
                                    @click="imgYl(lists,index)"
                                    />
                            </div>
                    </li>

                     <li>
                        <span>电话：</span>
                        <div class="recordText">{{item.userphone}}</div>
                    </li>
                    <li>
                        <span>详细地址：</span>
                        <div class="recordText">{{item.recordaddr}}</div>
                    </li>
                    <li>
                        <span>楼栋号：</span>
                        <div class="recordText">{{item.recordtoken}}</div>
                    </li>
                    <li>
                        <span>经度：</span>
                        <div class="recordText">{{item.recordlo}}</div>
                    </li>

                     <li>
                        <span>纬度：</span>
                        <div class="recordText">{{item.recordla}}</div>
                    </li>
                    <li>
                        <span>入户时间：</span>
                        <div class="recordText">{{item.recorddate}}</div>
                    </li>

                    
                </ul>
                    
             </div>
            </div>  

            <div v-else>
                     <div class="nodate">
                          <img src="../assets/images/noDate.png" alt="">
                          <p>暂无详细信息！</p>
                     </div>
            </div>
              <van-dialog v-model="showDel" title="确定删除入户的信息？" show-cancel-button @confirm='confirmQr'>  </van-dialog>
     </div>
</template>
<script>
import {apiUrl,getlisting} from '../utils/apiUrl'
import { ImagePreview } from 'vant';
export default {
    name:'householdsLists',
    data(){
        return{
             imgLocality:process.env.BASE_URL_HTTPS+'images/',//拼接图片
            lists:[],
            showPic:false,
            index:0,
             images: [],
             showDel:false,
             delIndex:0,//点击删除的下标
             delId:0,//点击删除的Id 
       
        }
    },
    mounted(){
       let  recorddate =  this.$route.query.recorddate
       this.getLists(this.$route.query.userphone, recorddate.split(' ')[0])
    },
    methods:{
        imgYl(lis,index){
            this.showPic=true
           let lisimg = lis.map(item=>{ return item.recordimg})
           ImagePreview({
             images:lisimg,
             startPosition:index
           })
        },
        del(index,delId){//删除弹窗
           this.showDel=true
           this.delIndex=index
           this.delId=delId
        },
        confirmQr(){//删除弹窗确认按钮
         //静态删除数组
           const that= this
           //console.log('that.delId',that.delId)
          //删除接口数据
            getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdindoordeleteIndoorById,{params:{id:that.delId}})
            .then(res=>{
            // console.log('删除接口数据',res)
                setTimeout(()=>{
                     that.lists.splice(this.delIndex,1)
                     that.$toast.success('删除成功！')
                },2000)
                
            })
         

        },
        // onChange(index){
        //      console.log('index',index)
        //      this.index=index
        // },
          getLists(userphone,recorddate){
               let data={
                     phone:userphone,
                     dates:recorddate
               }
                getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxdindoorfindByPhone,{params:data})
                .then(res=>{
                     
                     if(res.data.length!=0){
                         this.lists=res.data
                     }else{

                     }
                })
          }
    }
}
</script>

<style lang='scss' scoped>
    // .houserholdsLists{
    //     .lis{
    //       width: 95%; margin: auto; padding: 10px 0 0 0; margin: 10px auto auto auto; overflow: hidden;
    //         border-radius: 5px; background: #f2f2f2; position: relative;
    //         .close{position: absolute; top:5px ; right: 10px;
    //           >img{width: 20px; height: 20px;}
    //         }
    //         ul{
    //             li{
    //                  display: flex; align-items: flex-start;  justify-content: flex-start; margin:  0 0  10px 0;
    //                 >span{font-size: 14px; color: #333;  text-align: right; font-weight: 700; display: inline-block; width: 80px; height: 20px; line-height: 20px;}
    //                 >div{margin:  0 0  0 10px;
    //                   &.recordText{ font-size: 14px; color: #333; width: calc(100% - 100px); text-align: left;}
    //                 }
                   
    //             }
    //         }
    //     }
    // }

    // .nodate{
    //     padding: 20% 2%;  text-align: center;
    //     >p{ font-size: 16px; color: #666;}
    // }
</style>