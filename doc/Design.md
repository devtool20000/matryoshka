# Design of Matryoshka

## Motivation
The Matryoshka server is developed to create instant mock server for frontend team 
especially when:
* the backend teams can't deliver the API at the beginning phase
* when backend is composed from several micro services which developed by different teams
* when mock API needs to be merged with existing API while. 

> **Traditional API development requires frontend developers to wait for a long time until they can test the api** 
![traditional api development](images/traditional_api_development.png)

> **With Matryoshka server, frontend developer can directly jump to api testing and integrating without waiting for backend team.**
![matryoshka mockapi development](images/matryoshka_mock_server_development.png)


## Architecture of Matryoshka
Matryoshka consists of a single **Proxy API Gateway** + several of **Request Rewriters** and **Response Rewriters**. 
* The **Proxy API Gateway* handles the routings to **Upstream Servers**. 
* The **Request Rewriter** can rewrite the ```path, query, header, body, method``` of the request send to the **Upstream Server**.
* Once **Upstream Server** response, the **Response Rewriter** will update the ```response data, header, status code``` and finally returns back to frontend

![matryoshka architecture](matryoshka_architecture.png)



