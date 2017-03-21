//
//  ViewController.m
//  AppTestDemo
//
//  Created by wangyh on 2017/1/9.
//  Copyright © 2017年 wangyh. All rights reserved.
//

#import "ViewController.h"
#import <AppTestFramework/AppTestFramework.h>

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

- (IBAction) doTest
{
    
    TestFunction *test = [[TestFunction alloc]init];
    [test callFunc:self:@"测试"];
}

@end
