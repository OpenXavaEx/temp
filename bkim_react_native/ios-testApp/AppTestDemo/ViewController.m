//
//  ViewController.m
//  AppTestDemo
//
//  Created by wangyh on 2017/1/9.
//  Copyright © 2017年 wangyh. All rights reserved.
//

#import "ViewController.h"
#import <BKIM_ReactNative_Framework/BKIM_ReactNative_Framework.h>

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction) showAbout {
    BKIM_RN *bkim = [[BKIM_RN alloc]init];
    [bkim showAbout:self:@"测试程序💻"];
}

@end
