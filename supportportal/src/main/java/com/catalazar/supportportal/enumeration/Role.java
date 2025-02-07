package com.catalazar.supportportal.enumeration;

import static com.catalazar.supportportal.constant.Authority.*;

public enum Role {
    ROLE_USER(USER_AUTHORITIES),
    ROLE_HR(HR_AUTHORITIES),
    ROLE_MANAGER(MANAGER_AUTHORITIES),
    ROLE_ADMIN(ADMIN_AUTHORITIES),
    ROLE_SUPER_ADMIN(SUPER_ADMIN_AUTHORITIES);

    private String[] authorities;


    Role(String...authorities) {    //constructor
        this.authorities=authorities;
    }

    public String[] getAuthorities(){
        return authorities;
    }
}
