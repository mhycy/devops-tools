# devops-tools
个人使用的运维工具 & 脚本的合集

## 目录
- tools
  - acme
    - domain-docker-issue
  - ddns
    - ros-aliyun-schedule

## 工具说明
### ACME
#### domain-docker-issue
使用docker进行证书签发, 需要本地挂载一个ACME工作目录用于中间数据以及最终证书的存储

### DDNS
#### ros-aliyun-schedule
基于Aliyun的DDNS服务，使用RouterOS API访问路由器并获取指定interface的地址进行IP刷新