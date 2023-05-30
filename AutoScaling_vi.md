# Hành trình đi tìm auto scaling

Bắt đầu tìm hiểu về auto scaling thì mình nghĩ đến ngay nginx rồi chạy đi học tìm hiểu nginx thử. Vì nghe nói có thể Load Balancing (LB) cho Server, mà LB thì phải đi đôi với Auto Scaling (AS) các kiểu nó mới chuẩn bài.

## Nginx thẳng tiến

Đi học mấy thứ cơ bản của nginx như file nginx configuration ở đâu, conf.d là làm gì

- Nginx file config chính nằm ở /etc/nginx/nginx.conf.
- Folder /etc/nginx/conf.d dùng cho http server theo cấu hình mặc định của nginx.
- Ngoài ra nếu muốn custom thêm cho mấy loại giao thức khác ví dụ như stream UDP hay TCP thì mần một cái folder.d riêng rồi include vào file còn chính.
- Còn nữa, từ từ viết tiếp (\***\*\*\*\*\*** Chỗ này còn thiếu nè \***\*\*\*\*\*\*\***)

_Xamlol time: Rồi còn có cả ông Nginx Plus, ông làm nginx open source rồi mà kiểu thiếu tiền. Làm ra chẳng nhẽ nhiều người dùng rứa mà không có đồng nào? Rồi cũng nghĩ ra làm thêm plugin, thêm bớt vài tính năng để xin ít để ủng hộ cho bản plus open source_

<details>
<summary>So sánh thử 2 bản open source vs plus là biết nó khác cái chỗ mô liền:</summary>

| Feature                                                                          | Nginx Open Source | Nginx Plus |
| -------------------------------------------------------------------------------- | ----------------- | ---------- |
| **Load balancer**                                                                | \_\_\_            | \_\_\_     |
| HTTP and TCP/UDP support                                                         | Yes               | Yes        |
| Layer 7 request routing                                                          | Yes               | Yes        |
| Active health checks                                                             |                   | Yes        |
| DNS service-discovery integration                                                |                   | Yes        |
| **Content cache**                                                                | \_\_\_            | \_\_\_     |
| Static and dynamic content caching                                               | Yes               | Yes        |
| Cache-purging API                                                                |                   | Yes        |
| **Web server and reverse proxy**                                                 | \_\_\_            | \_\_\_     |
| Origin server for static content                                                 | Yes               | Yes        |
| Reverse proxy: HTTP, FastCGI, memcached, SCGI, uwsgi                             | Yes               | Yes        |
| HTTP/2 gateway                                                                   | Yes               | Yes        |
| gRPC proxy                                                                       | Yes               | Yes        |
| **Security controls**                                                            | \_\_\_            | \_\_\_     |
| HTTP Basic Authentication                                                        | Yes               | Yes        |
| HTTP authentication sub requests                                                 | Yes               | Yes        |
| IP address‑based access control lists                                            | Yes               | Yes        |
| Rate limiting                                                                    | Yes               | Yes        |
| Dual‑stack RSA/ECC SSL/TLS offload                                               | Yes               | Yes        |
| TLS 1.3 support                                                                  | Yes               | Yes        |
| JWT authentication                                                               |                   | Yes        |
| OpenID Connect single sign‑on (SSO)                                              |                   | Yes        |
| NGINX App Protect (additional cost)                                              |                   | Yes        |
| **Monitoring**                                                                   | \_\_\_            | \_\_\_     |
| Export to external monitoring tools                                              | Yes               | Yes        |
| Built-in dashboard                                                               |                   | Yes        |
| Extended status with 100+ additional metrics                                     |                   | Yes        |
| **High availability (HA)**                                                       | \_\_\_            | \_\_\_     |
| Active‑active                                                                    |                   | Yes        |
| Active‑passive                                                                   |                   | Yes        |
| Configuration synchronization across cluster                                     |                   | Yes        |
| State sharing: sticky‑learn session persistence, rate limiting, key‑value stores |                   | Yes        |
| **Programmability**                                                              | \_\_\_            | \_\_\_     |
| NGINX JavaScript module                                                          | Yes               | Yes        |
| NGINX Plus API for dynamic reconfiguration                                       |                   | Yes        |
| Key‑value store                                                                  |                   | Yes        |
| Dynamic reconfiguration without process reloads                                  |                   | Yes        |
| **Streaming media**                                                              | \_\_\_            | \_\_\_     |
| Live streaming: RTMP, HLS, DASH                                                  | Yes               | Yes        |
| VOD: Flash (FLV), MP4                                                            | Yes               | Yes        |
| Adaptive bitrate VOD: HLS, HDS                                                   |                   | Yes        |
| MP4 bandwidth controls                                                           |                   | Yes        |
| **Third-party ecosystem**                                                        | \_\_\_            | \_\_\_     |
| Ingress controller                                                               | Yes               | Yes        |
| OpenShift Router                                                                 | Yes               | Yes        |
| Dynamic modules repository                                                       |                   | Yes        |
| Commercial support                                                               |                   | Yes        |

</details>
Sau khi tìm hiểu thì chỉ nginx và docker thì không làm lên auto scaling được với docker bình thường. Chỉ scale được bằng tay =))

```sh
docker-compose up nodejs —scale nodejs=3
```

“Ừ thì cũng được Load balancing rồi, zui qué” Câu này chỉ trấn an bản thân thôi :((
[Link branch load balancing](https://github.com/blankhat1610/nginx-node-auto-scaling/tree/load-balancing-nginx-docker)

## Ngã rẽ - con đường vọc vạch Docker Swarm

Hồi trước nghe thì giống kiểu một con lớn có thể quản lý nhiều con nhỏ (server) thì qua đọc thử xem nó có thể auto scaling không. Đọc xong thì mới biết là docker swarm cũng k thể mần được auto scaling mà phải custom đủ thứ.

Vì muốn auto scaling bên docker swarm thì cũng cần khá nhiều script check monitoring cpu, memory, …

Vọc tìm hiểu cái mô hình tổng quan của docker swarm thì thấy [video](https://www.youtube.com/watch?v=KC4Ad1DS8xU) giới thiệu rất hay và gọn về docker swarm.

Xem xong video thì thấy cần một cụm các VM để cấu hình. Có solution là dùng docker-machine để quản lý các máy ảo bằng lệnh. Nhưng docker-machine cần phần mềm VM driver để tạo. Trong docs của thèm docker thì gợi ý dùng virtualbox driver. Nhưng khi cài xong thi bị lỗi như này. Tức không chạy được trên môi trường của Apple Silicon chip. Toang =))

```sh
docker-machine create --driver virtualbox manager
Running pre-create checks...
Error with pre-create check: "This computer doesn't have VT-X/AMD-v enabled. Enabling it in the BIOS is mandatory"
```

Sẵn tiện giải thích tại ren dùng docker machine mà không dùng luôn máy ảo trên virtualbox các kiểu.

- Docker machine cache VM images. Chạy một con đầu tức là đã tải xong image rồi, lần sau chạy chỉ lấy cache để tạo thôi.
- Dùng VM bản nhẹ nhất có thể để có thể chạy được docker và những OS tools cơ bản.
- Tạo sẵn cho mình một network giữa các hosts có thể giao tiếp với nhau, tạo sẵn DNS cho các host để container trong đó có thể giao tiếp với các container khác của các host khác nhau.
- Dùng docker như ở local, tức docker client được install trên hosts. Khác với VM bình thường phải SSH vào rồi mới chạy lệnh docker đã cài trên đó.

## Quyết định switch qua luôn Kubernetes

_Hai tools mà mình tìm được rất ngon về monitor và bắt log là prometheus & grafana ![Monitoring graph](https://aperogeek.fr/wp-content/uploads/2019/10/prometheus_k8s_archi-1024x640.png)_
