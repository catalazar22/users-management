package com.catalazar.supportportal;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.http.HttpStatus;

import java.util.Date;

public class HttpResponse {
    @JsonFormat(shape = JsonFormat.Shape.STRING , pattern = "dd-MM-yyyy hh:mm:ss" , timezone = "Europe/Athens")
    private Date timeStamp;
    private int httpStatusCode; //200,201 - succes 400 - user error , 500 - fail
    private HttpStatus httpStatus; //http status - 200
    private String reaseon;// http reason - ok
    private String message; //raspunsul tau la eroare code:200 -> ok -> your request was successful

    public HttpResponse(int httpStatusCode, HttpStatus httpStatus, String reaseon, String message) {
        this.timeStamp = new Date();
        this.httpStatusCode = httpStatusCode;
        this.httpStatus = httpStatus;
        this.reaseon = reaseon;
        this.message = message;
    }

    public HttpResponse() {}
    public int getHttpStatusCode() {
        return httpStatusCode;
    }

    public void setHttpStatusCode(int httpStatusCode) {
        this.httpStatusCode = httpStatusCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public String getReaseon() {
        return reaseon;
    }

    public void setReaseon(String reaseon) {
        this.reaseon = reaseon;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Date getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(Date timeStamp) {
        this.timeStamp = timeStamp;
    }
}
