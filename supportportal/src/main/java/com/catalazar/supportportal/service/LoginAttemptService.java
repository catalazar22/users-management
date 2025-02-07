package com.catalazar.supportportal.service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

import static java.util.concurrent.TimeUnit.MINUTES;

@Service
public class LoginAttemptService {
    private static final int MAXIMUM_NUMBER_OF_ATTEMPT = 5;
    private static final int ATTEMPT_INCREMENT = 1;
    private LoadingCache<String, Integer> loginAttemptCache;

    public LoginAttemptService(){ //define the cache memory!
        super();
        loginAttemptCache = CacheBuilder.newBuilder().expireAfterWrite(15 , MINUTES).
                maximumSize(100).build(new CacheLoader<String, Integer>(){
                    public Integer load(String key){
                        return 0;
                    }
                });
    }

    public void evictUserFromLoginAttemptCache(String username){   ///removes an enetry to the cache
        loginAttemptCache.invalidate(username);
    }

    public void addUserToLoginAttemptCache(String username) {
        int attempts = 0;
        try {
            attempts = ATTEMPT_INCREMENT + loginAttemptCache.get(username); // 0->1 sau 1->2 etc
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        loginAttemptCache.put(username, attempts); //punem numarul de incercari de login in memoria cache
    }
    public boolean hasExcedeedMaxAttempts(String username) {
        try {
            return loginAttemptCache.get(username) >= MAXIMUM_NUMBER_OF_ATTEMPT;
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return false;
    }
}
