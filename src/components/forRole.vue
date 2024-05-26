<template>
     <div class="forRoleContent" >
          <div class="forRole">
            <van-form @submit="onSubmit">
                <van-field
                    v-model="oldJob"
                    name="oldJob"
                    label="原-职位"
                    placeholder="职位"
                     readonly 
                />

                <van-field
                    v-model="tel"
                    name="userphone"
                    label="电话号码"
                    placeholder="电话号码"
                    readonly 
                />

                 <van-field
                    v-model="newJob"
                    name="userrole"
                    label="变跟职位"
                    placeholder="变跟职位"
                    readonly 
                />
                
                <van-field name="radio" label="单选框">
                    <template #input>
                        <van-radio-group v-model="radio" direction="horizontal">
                        <van-radio name="1">同意</van-radio>
                        <van-radio name="2">不同意</van-radio>
                        </van-radio-group>
                    </template>
                    </van-field>
                <div style="margin: 16px;">
                    <van-button round block  type="info" native-type="submit">提交</van-button>
                </div>
                </van-form>
          </div><!--/forRole-->  


     
          
     </div>
</template>
<script>
import {apiUrl, filetest,getlisting} from '../utils/apiUrl'
export default {
     data(){
        return{
            oldJob:'',//原先的职业
            tel:'',//电话号码
            newJob:'',//变更的职业
            radio:'1' //1 同意 ，2不同意
        }
     },
     mounted(){
          
        let queryArry=this.$route.query
        let arry= queryArry.changeName.split('-')
        this.oldJob=arry[0];
        this.newJob=arry[1];
        this.tel=queryArry.tel;
     },
     methods:{
          onSubmit(values) {
            let  data={
                        userphone:values.userphone,
                        userrole:this.$route.query.changeName
                     }
             switch(values.radio){
                //1 同意 ，2不同意
                case '1':
                   this.agreePeople(data)
                break;
                case '2':
                     this.noagreePeople(data)
                break;
             }
         },
         //同意申请变更角色
           agreePeople(data){
            // 自定义加载图标
             getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxduseragreeForRole,{params:data})
             .then(res=>{
                //console.log(res)
             })
                this.$toast.loading({
                        message: '正在提交申请变更...',
                        forbidClick: true,
                        loadingType: 'spinner',
                        duration:3000
                    })
            
                    setTimeout(()=>{
                        this.$toast.success({
                                message: '提交成功，正在返回上一页面！',
                                forbidClick: true,
                                loadingType: 'spinner',
                                duration:2000
                            })
                    },3000)

                    setTimeout(() => {
                        this.$router.go(-1)
                    },5000);
        
           },
         //不同意申请变更角色
           noagreePeople(data){
             getlisting(process.env.BASE_URL_HTTPS+apiUrl.hxduserdisagreeForRole,{params:data})
             .then(res=>{
             })
                      this.$toast.loading({
                        message: '正在提交申请变更...',
                        forbidClick: true,
                        loadingType: 'spinner',
                        duration:3000
                    })
            
                    setTimeout(()=>{
                        this.$toast.success({
                                message: '提交成功，正在返回上一页面！',
                                forbidClick: true,
                                loadingType: 'spinner',
                                duration:2000
                            })
                    },3000)

                    setTimeout(() => {
                        this.$router.go(-1)
                    },5000);
           }
     }
}
</script>

<style lang='scss' >
      html,body{background: #fff;}
     
      .forRole{ width: 95%;  margin: auto; padding: 5%  0 0 0;}
</style>